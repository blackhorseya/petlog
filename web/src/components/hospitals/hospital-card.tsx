"use client";

import * as React from "react";
import { MapPin, Phone, Building } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Hospital } from "@/lib/types/hospital";

interface HospitalCardProps {
  hospital: Hospital;
  onViewDetail?: (hospital: Hospital) => void;
  onNavigate?: (hospital: Hospital) => void;
}

export function HospitalCard({
  hospital,
  onViewDetail,
  onNavigate,
}: HospitalCardProps) {
  const handleViewDetail = () => {
    onViewDetail?.(hospital);
  };

  const handleNavigate = () => {
    onNavigate?.(hospital);
  };

  // 格式化電話號碼
  const formatPhone = (phone: string) => {
    if (!phone) return "";
    // 簡單的電話號碼格式化
    if (phone.length === 10) {
      return `${phone.slice(0, 2)}-${phone.slice(2, 5)}-${phone.slice(5)}`;
    }
    return phone;
  };

  // 取得狀態顏色
  const getStatusColor = (status: string) => {
    switch (status) {
      case "開業":
        return "text-green-600 bg-green-50";
      case "歇業":
        return "text-red-600 bg-red-50";
      case "停業":
        return "text-yellow-600 bg-yellow-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <h3 className="font-semibold text-lg leading-tight line-clamp-2">
              {hospital.name}
            </h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Building className="h-3 w-3" />
              <span>{hospital.license_type}</span>
            </div>
          </div>
          <div
            className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
              hospital.status
            )}`}
          >
            {hospital.status}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* 地址 */}
        <div className="flex items-start gap-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <span className="text-muted-foreground line-clamp-2">
            {hospital.address}
          </span>
        </div>

        {/* 電話 */}
        {hospital.phone && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground">
              {formatPhone(hospital.phone)}
            </span>
          </div>
        )}

        {/* 獸醫師 */}
        <div className="text-sm">
          <span className="text-muted-foreground">獸醫師：</span>
          <span className="font-medium">{hospital.veterinarian}</span>
        </div>

        {/* 執照資訊 */}
        <div className="text-xs text-muted-foreground">
          執照號碼：{hospital.license_no}
        </div>
      </CardContent>

      <CardFooter className="pt-3 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleViewDetail}
          className="flex-1"
        >
          查看詳情
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={handleNavigate}
          className="flex-1"
        >
          <MapPin className="mr-1 h-3 w-3" />
          導航
        </Button>
      </CardFooter>
    </Card>
  );
}