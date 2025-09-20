"use client";

import * as React from "react";
import { Wrapper, Status } from "@googlemaps/react-wrapper";
import { MapPin, Loader2, AlertCircle } from "lucide-react";

import { Hospital } from "@/lib/types/hospital";
import { cn } from "@/lib/utils";

interface HospitalMapProps {
  hospitals: Hospital[];
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
  className?: string;
  onHospitalClick?: (hospital: Hospital) => void;
  isLoading?: boolean;
  showUserLocation?: boolean;
  onLocationFound?: (location: { lat: number; lng: number }) => void;
  onLocationError?: (error: string) => void;
  requestLocation?: boolean;
}

interface MapComponentProps {
  hospitals: Hospital[];
  center: { lat: number; lng: number };
  zoom: number;
  onHospitalClick?: (hospital: Hospital) => void;
  showUserLocation?: boolean;
  onLocationFound?: (location: { lat: number; lng: number }) => void;
  onLocationError?: (error: string) => void;
  requestLocation?: boolean;
}

// 內部地圖元件，只在 Google Maps API 載入後渲染
function MapComponent({
  hospitals,
  center,
  zoom,
  onHospitalClick,
  showUserLocation = false,
  onLocationFound,
  onLocationError,
  requestLocation = false
}: MapComponentProps) {
  const mapRef = React.useRef<HTMLDivElement>(null);
  const [map, setMap] = React.useState<google.maps.Map>();
  const markersRef = React.useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const infoWindowRef = React.useRef<google.maps.InfoWindow>();
  const userLocationMarkerRef = React.useRef<google.maps.marker.AdvancedMarkerElement>();
  const userLocationFoundRef = React.useRef<boolean>(false); // 追蹤是否已找到用戶位置

  // 初始化地圖
  React.useEffect(() => {
    if (mapRef.current && !map) {
      const newMap = new google.maps.Map(mapRef.current, {
        center,
        zoom,
        mapId: "DEMO_MAP_ID", // 需要啟用 Advanced Markers
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        streetViewControl: false,
        mapTypeControl: true,
        fullscreenControl: true,
        zoomControl: true,
        // 注意：使用 mapId 時不能設定 styles，樣式需透過 Cloud Console 控制
      });
      setMap(newMap);

      // 初始化 InfoWindow
      const newInfoWindow = new google.maps.InfoWindow({
        disableAutoPan: false,
        maxWidth: 300,
      });
      infoWindowRef.current = newInfoWindow;
    }
  }, [center, zoom, map]);

  // 新增醫院標記
  React.useEffect(() => {
    if (!map || hospitals.length === 0) return;

    // 清除現有標記
    markersRef.current.forEach((marker) => marker.map = null);
    markersRef.current = [];

    const newMarkers = hospitals.map((hospital) => {
      // 建立自定義標記元素
      const markerElement = document.createElement('div');
      markerElement.innerHTML = `
        <div style="
          background: #dc2626;
          border: 2px solid #991b1b;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          width: 24px;
          height: 24px;
          position: relative;
          cursor: pointer;
        ">
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(45deg);
            color: white;
            font-size: 12px;
            font-weight: bold;
          ">+</div>
        </div>
      `;

      const marker = new google.maps.marker.AdvancedMarkerElement({
        position: {
          lat: hospital.coordinates.latitude,
          lng: hospital.coordinates.longitude,
        },
        map,
        title: hospital.name,
        content: markerElement,
      });

      // 點擊標記事件
      marker.addListener("click", () => {
        if (infoWindowRef.current) {
          // 建立 InfoWindow 內容
          const contentString = `
            <div style="padding: 8px; max-width: 280px;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1f2937;">
                ${hospital.name}
              </h3>
              <div style="margin-bottom: 6px; display: flex; align-items: flex-start; gap: 6px;">
                <span style="color: #6b7280; font-size: 14px; flex-shrink: 0;">📍</span>
                <span style="color: #4b5563; font-size: 14px; line-height: 1.4;">
                  ${hospital.address}
                </span>
              </div>
              ${hospital.phone ? `
                <div style="margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
                  <span style="color: #6b7280; font-size: 14px;">📞</span>
                  <span style="color: #4b5563; font-size: 14px;">
                    ${hospital.phone}
                  </span>
                </div>
              ` : ''}
              <div style="margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
                <span style="color: #6b7280; font-size: 14px;">👨‍⚕️</span>
                <span style="color: #4b5563; font-size: 14px;">
                  ${hospital.veterinarian}
                </span>
              </div>
              <div style="margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                <span style="
                  background: ${hospital.status === '開業' ? '#dcfce7' : hospital.status === '歇業' ? '#fef2f2' : '#fefce8'};
                  color: ${hospital.status === '開業' ? '#16a34a' : hospital.status === '歇業' ? '#dc2626' : '#ca8a04'};
                  padding: 2px 8px;
                  border-radius: 12px;
                  font-size: 12px;
                  font-weight: 500;
                ">
                  ${hospital.status}
                </span>
              </div>
              <div style="display: flex; gap: 8px; margin-top: 12px;">
                <button
                  onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${hospital.coordinates.latitude},${hospital.coordinates.longitude}', '_blank')"
                  style="
                    background: #3b82f6;
                    color: white;
                    border: none;
                    padding: 6px 12px;
                    border-radius: 6px;
                    font-size: 12px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                  "
                >
                  🧭 導航
                </button>
              </div>
            </div>
          `;

          infoWindowRef.current.setContent(contentString);
          infoWindowRef.current.open(map, marker);
        }

        // 也觸發外部回調
        onHospitalClick?.(hospital);
      });

      return marker;
    });

    markersRef.current = newMarkers;

    // 只有在沒有找到用戶位置時，才調整地圖範圍以包含所有標記
    if (newMarkers.length > 1 && !userLocationFoundRef.current) {
      const bounds = new google.maps.LatLngBounds();
      newMarkers.forEach((marker) => {
        if (marker.position) bounds.extend(marker.position);
      });
      map.fitBounds(bounds);
    }
  }, [map, hospitals, onHospitalClick]);

  // 使用者定位功能
  React.useEffect(() => {
    if (!map || !requestLocation) return;

    // 重置定位狀態
    userLocationFoundRef.current = false;

    if (!navigator.geolocation) {
      onLocationError?.("此瀏覽器不支援地理位置功能");
      return;
    }

    // 檢查權限狀態
    const checkPermissions = async () => {
      try {
        if (navigator.permissions) {
          const status = await navigator.permissions.query({ name: "geolocation" as PermissionName });
          if (status.state === "denied") {
            onLocationError?.("位置存取被拒絕，請到瀏覽器設定開啟定位與精確位置");
            return false;
          }
        }
        return true;
      } catch (error) {
        // 某些瀏覽器不支援 permissions API，繼續嘗試定位
        return true;
      }
    };

    // 嘗試 IP 地理位置作為最後的降級選項
    const tryIPLocation = async () => {
      // IP 定位服務列表（按可靠性排序）
      const ipServices = [
        {
          name: 'ipapi.co',
          url: 'https://ipapi.co/json/',
          extractData: (data: any) => ({
            lat: data.latitude,
            lng: data.longitude,
            city: data.city,
            country: data.country_name
          })
        },
        {
          name: 'ip-api.com',
          url: 'http://ip-api.com/json/',
          extractData: (data: any) => ({
            lat: data.lat,
            lng: data.lon,
            city: data.city,
            country: data.country
          })
        },
        {
          name: 'ipinfo.io',
          url: 'https://ipinfo.io/json',
          extractData: (data: any) => {
            const [lat, lng] = data.loc?.split(',').map(Number) || [null, null];
            return {
              lat,
              lng,
              city: data.city,
              country: data.country
            };
          }
        },
        {
          name: 'geoplugin.net',
          url: 'http://www.geoplugin.net/json.gp',
          extractData: (data: any) => ({
            lat: parseFloat(data.geoplugin_latitude),
            lng: parseFloat(data.geoplugin_longitude),
            city: data.geoplugin_city,
            country: data.geoplugin_countryName
          })
        }
      ];

      let lastError: string = '';

      for (const service of ipServices) {
        try {
          console.log(`嘗試使用 ${service.name} 進行 IP 定位...`);

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000); // 8秒超時

          const response = await fetch(service.url, {
            signal: controller.signal,
            headers: {
              'Accept': 'application/json',
            }
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          const data = await response.json();
          const location = service.extractData(data);

          if (location.lat && location.lng &&
              !isNaN(location.lat) && !isNaN(location.lng) &&
              location.lat >= -90 && location.lat <= 90 &&
              location.lng >= -180 && location.lng <= 180) {

            const userLocation = {
              lat: location.lat,
              lng: location.lng,
            };

            // 清除之前的使用者位置標記
            if (userLocationMarkerRef.current) {
              userLocationMarkerRef.current.map = null;
            }

            // 建立使用者位置標記元素（使用不同顏色表示是 IP 定位）
            const userMarkerElement = document.createElement('div');
            userMarkerElement.innerHTML = `
              <div style="
                width: 24px;
                height: 24px;
                background: #f59e0b;
                border: 3px solid white;
                border-radius: 50%;
                box-shadow: 0 2px 8px rgba(245, 158, 11, 0.4);
                cursor: pointer;
                position: relative;
              ">
                <div style="
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%);
                  width: 8px;
                  height: 8px;
                  background: white;
                  border-radius: 50%;
                  opacity: 0.9;
                "></div>
                <!-- 脈動效果表示不精確 -->
                <div style="
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%);
                  width: 24px;
                  height: 24px;
                  border: 2px solid #f59e0b;
                  border-radius: 50%;
                  opacity: 0.6;
                  animation: pulse 2s infinite;
                "></div>
              </div>
              <div style="
                position: absolute;
                top: -14px;
                left: 50%;
                transform: translateX(-50%);
                background: #f59e0b;
                color: white;
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 9px;
                font-weight: 600;
                white-space: nowrap;
                pointer-events: none;
                box-shadow: 0 1px 3px rgba(0,0,0,0.2);
              ">網路</div>
              <style>
                @keyframes pulse {
                  0% {
                    transform: translate(-50%, -50%) scale(1);
                    opacity: 0.6;
                  }
                  50% {
                    transform: translate(-50%, -50%) scale(1.2);
                    opacity: 0.2;
                  }
                  100% {
                    transform: translate(-50%, -50%) scale(1);
                    opacity: 0.6;
                  }
                }
              </style>
            `;

            // 建立使用者位置標記
            const newUserMarker = new google.maps.marker.AdvancedMarkerElement({
              position: userLocation,
              map,
              title: `大概位置（基於 IP 定位）${location.city ? `\n${location.city}, ${location.country}` : ''}`,
              content: userMarkerElement,
            });

            // 為 IP 定位標記添加點擊事件，顯示詳細資訊
            newUserMarker.addListener("click", () => {
              if (infoWindowRef.current) {
                const contentString = `
                  <div style="padding: 8px; max-width: 250px;">
                    <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #f59e0b;">
                      📍 大概位置（IP 定位）
                    </h3>
                    <div style="color: #6b7280; font-size: 12px; line-height: 1.4; margin-bottom: 6px;">
                      這是基於您的網路 IP 位址推估的大概位置
                    </div>
                    ${location.city ? `
                      <div style="color: #4b5563; font-size: 13px; margin-bottom: 4px;">
                        ${location.city}, ${location.country}
                      </div>
                    ` : ''}
                    <div style="color: #f59e0b; font-size: 11px; font-weight: 500; margin-top: 8px;">
                      精確度: ±5-50 公里
                    </div>
                  </div>
                `;
                infoWindowRef.current.setContent(contentString);
                infoWindowRef.current.open(map, newUserMarker);
              }
            });

            userLocationMarkerRef.current = newUserMarker;
            userLocationFoundRef.current = true; // 標記已找到用戶位置
            onLocationFound?.(userLocation);

            // 將地圖中心移至使用者位置，使用適當的縮放級別
            // 使用 setTimeout 確保地圖完全載入後再移動
            setTimeout(() => {
              map.setCenter(userLocation);
              map.setZoom(12); // 約 10 公里範圍，適合 IP 定位的精確度
            }, 100);

            console.log(`✅ ${service.name} IP 定位成功:`, location);
            return; // 成功後退出函數

          } else {
            throw new Error('位置資料無效');
          }

        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : '未知錯誤';
          lastError = `${service.name}: ${errorMsg}`;
          console.warn(`❌ ${service.name} 失敗:`, errorMsg);

          // 如果是 AbortError（超時），繼續嘗試下一個服務
          if (error instanceof Error && error.name === 'AbortError') {
            console.warn(`${service.name} 請求超時，嘗試下一個服務...`);
          }

          continue; // 嘗試下一個服務
        }
      }

      // 所有 IP 定位服務都失敗
      console.error('所有 IP 定位服務都失敗，最後錯誤:', lastError);
      onLocationError?.("無法取得任何位置資訊，請手動搜尋附近醫院或開啟 GPS 定位");
    };

    // 先嘗試高精度定位，失敗後降級為低精度，最後使用 IP 定位
    const tryGeolocation = (highAccuracy: boolean = true) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          // 清除之前的使用者位置標記
          if (userLocationMarkerRef.current) {
            userLocationMarkerRef.current.map = null;
          }

          // 建立使用者位置標記元素（精確定位）
          const userMarkerElement = document.createElement('div');
          userMarkerElement.innerHTML = `
            <div style="
              width: 20px;
              height: 20px;
              background: #10b981;
              border: 3px solid white;
              border-radius: 50%;
              box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
              cursor: pointer;
              position: relative;
            ">
              <div style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 6px;
                height: 6px;
                background: white;
                border-radius: 50%;
              "></div>
            </div>
            ${highAccuracy ? `
              <div style="
                position: absolute;
                top: -12px;
                left: 50%;
                transform: translateX(-50%);
                background: #10b981;
                color: white;
                padding: 1px 4px;
                border-radius: 3px;
                font-size: 9px;
                font-weight: 600;
                white-space: nowrap;
                pointer-events: none;
              ">GPS</div>
            ` : `
              <div style="
                position: absolute;
                top: -12px;
                left: 50%;
                transform: translateX(-50%);
                background: #3b82f6;
                color: white;
                padding: 1px 4px;
                border-radius: 3px;
                font-size: 9px;
                font-weight: 600;
                white-space: nowrap;
                pointer-events: none;
              ">快速</div>
            `}
          `;

          // 建立使用者位置標記
          const newUserMarker = new google.maps.marker.AdvancedMarkerElement({
            position: userLocation,
            map,
            title: highAccuracy ? "您的位置（GPS 精確定位）" : "您的位置（快速定位）",
            content: userMarkerElement,
          });

          // 為精確定位標記添加點擊事件，顯示詳細資訊
          newUserMarker.addListener("click", () => {
            if (infoWindowRef.current) {
              const accuracy = position.coords.accuracy;
              const contentString = `
                <div style="padding: 8px; max-width: 250px;">
                  <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: ${highAccuracy ? '#10b981' : '#3b82f6'};">
                    📍 您的位置${highAccuracy ? '（GPS 定位）' : '（快速定位）'}
                  </h3>
                  <div style="color: #6b7280; font-size: 12px; line-height: 1.4; margin-bottom: 6px;">
                    ${highAccuracy ? '使用 GPS 衛星進行精確定位' : '使用網路訊號進行快速定位'}
                  </div>
                  <div style="color: #10b981; font-size: 11px; font-weight: 500; margin-top: 8px;">
                    精確度: ±${Math.round(accuracy)} 公尺
                  </div>
                </div>
              `;
              infoWindowRef.current.setContent(contentString);
              infoWindowRef.current.open(map, newUserMarker);
            }
          });

          userLocationMarkerRef.current = newUserMarker;
          userLocationFoundRef.current = true; // 標記已找到用戶位置
          onLocationFound?.(userLocation);

          // 將地圖中心移至使用者位置
          // 使用 setTimeout 確保地圖完全載入後再移動
          setTimeout(() => {
            map.setCenter(userLocation);
            map.setZoom(14);
          }, 100);
        },
        (error) => {
          // 如果高精度定位失敗且尚未嘗試低精度，則重試
          if (highAccuracy && (error.code === error.POSITION_UNAVAILABLE || error.code === error.TIMEOUT)) {
            console.log(`${error.code === error.TIMEOUT ? '高精度定位超時' : '高精度定位失敗'}，嘗試低精度定位`);

            // 提醒用戶正在嘗試低精度定位
            if (error.code === error.TIMEOUT) {
              onLocationError?.("🔍 精確定位超時，嘗試快速定位中...");
            } else {
              onLocationError?.("🔍 精確定位失敗，嘗試低精度定位中...");
            }

            // 短暫延遲後清除錯誤訊息（讓用戶看到進度）
            setTimeout(() => {
              tryGeolocation(false);
            }, 1000);
            return;
          }

          // 如果低精度也失敗，且不是權限問題，則嘗試 IP 定位
          if (!highAccuracy && error.code !== error.PERMISSION_DENIED) {
            console.log('GPS 定位完全失敗，嘗試 IP 定位');

            // 提醒用戶正在嘗試 IP 定位
            onLocationError?.("🌐 GPS 定位失敗，正在使用網路位置...");

            // 短暫延遲後開始 IP 定位
            setTimeout(() => {
              tryIPLocation();
            }, 1500);
            return;
          }

          let errorMessage = "無法取得位置資訊";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "❌ 位置存取被拒絕，請檢查瀏覽器設定並允許位置存取，或使用手動搜尋";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "🔍 GPS 定位失敗，嘗試網路定位中...";
              break;
            case error.TIMEOUT:
              errorMessage = "⏱️ 定位超時，嘗試其他方法中...";
              break;
          }

          // 只有權限被拒絕時才立即顯示錯誤
          if (error.code === error.PERMISSION_DENIED) {
            onLocationError?.(errorMessage);
          }
        },
        {
          enableHighAccuracy: highAccuracy,
          timeout: highAccuracy ? 15000 : 30000, // 增加超時時間
          maximumAge: 60000, // 1分鐘內的快取位置可接受
        }
      );
    };

    // 開始定位流程
    const startLocationProcess = async () => {
      const hasPermission = await checkPermissions();
      if (hasPermission) {
        tryGeolocation();
      }
    };

    startLocationProcess();
  }, [map, requestLocation, onLocationFound, onLocationError]);

  return <div ref={mapRef} className="w-full h-full" />;
}

// 載入狀態組件
function LoadingComponent() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-muted">
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="text-sm">載入地圖中...</span>
      </div>
    </div>
  );
}

// 錯誤狀態組件
function ErrorComponent({ error }: { error: Error }) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-muted">
      <div className="flex flex-col items-center gap-2 text-destructive">
        <AlertCircle className="h-8 w-8" />
        <span className="text-sm font-medium">地圖載入失敗</span>
        <span className="text-xs text-muted-foreground">{error.message}</span>
      </div>
    </div>
  );
}

// 主要地圖元件
export function HospitalMap({
  hospitals,
  center = { lat: 25.0330, lng: 121.5654 }, // 台北市預設座標
  zoom = 11,
  height = "400px",
  className,
  onHospitalClick,
  isLoading = false,
  showUserLocation = false,
  onLocationFound,
  onLocationError,
  requestLocation = false,
}: HospitalMapProps) {
  // 渲染狀態處理
  const render = (status: Status): React.ReactElement => {
    switch (status) {
      case Status.LOADING:
        return <LoadingComponent />;
      case Status.FAILURE:
        return <ErrorComponent error={new Error("Google Maps API 載入失敗")} />;
      case Status.SUCCESS:
        return (
          <MapComponent
            hospitals={hospitals}
            center={center}
            zoom={zoom}
            onHospitalClick={onHospitalClick}
            showUserLocation={showUserLocation}
            onLocationFound={onLocationFound}
            onLocationError={onLocationError}
            requestLocation={requestLocation}
          />
        );
    }
  };

  // 檢查是否有 Google Maps API Key
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return (
      <div className={cn("border rounded-lg", className)} style={{ height }}>
        <div className="w-full h-full flex items-center justify-center bg-muted">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <MapPin className="h-8 w-8" />
            <span className="text-sm font-medium">需要設定 Google Maps API Key</span>
            <span className="text-xs">請在環境變數中設定 NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</span>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={cn("border rounded-lg", className)} style={{ height }}>
        <LoadingComponent />
      </div>
    );
  }

  return (
    <div className={cn("border rounded-lg overflow-hidden", className)} style={{ height }}>
      <Wrapper
        apiKey={apiKey}
        render={render}
        libraries={["marker"]}
      />
    </div>
  );
}