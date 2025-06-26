"use client";

import React, { useState, useMemo } from 'react';
import { Calendar, momentLocalizer, View, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { HealthLog } from '@/lib/types/health-log';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// 設置 moment 本地化
moment.locale('zh-tw');
const localizer = momentLocalizer(moment);

interface HealthLogEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: HealthLog;
  type: 'weight' | 'food' | 'behavior' | 'litter' | 'general';
}

interface HealthLogCalendarProps {
  healthLogs: HealthLog[];
  onSelectEvent?: (event: HealthLogEvent) => void;
  onSelectSlot?: (slotInfo: { start: Date; end: Date }) => void;
  onNavigate?: (date: Date) => void;
  onView?: (view: View) => void;
}

export default function HealthLogCalendar({
  healthLogs,
  onSelectEvent,
  onSelectSlot,
  onNavigate,
  onView,
}: HealthLogCalendarProps) {
  const [currentView, setCurrentView] = useState<View>(Views.MONTH);
  const [currentDate, setCurrentDate] = useState(new Date());

  // 將健康記錄轉換為日曆事件
  const events = useMemo(() => {
    const calendarEvents: HealthLogEvent[] = [];

    healthLogs.forEach((log) => {
      const date = new Date(log.date);
      
      // 為每個健康記錄建立事件項目
      if (log.weight_kg && log.weight_kg > 0) {
        calendarEvents.push({
          id: `${log.id}-weight`,
          title: `體重: ${log.weight_kg}kg`,
          start: date,
          end: date,
          resource: log,
          type: 'weight',
        });
      }

      if (log.food_gram && log.food_gram > 0) {
        calendarEvents.push({
          id: `${log.id}-food`,
          title: `飲食: ${log.food_gram}g`,
          start: date,
          end: date,
          resource: log,
          type: 'food',
        });
      }

      if (log.behaviour_notes) {
        calendarEvents.push({
          id: `${log.id}-behavior`,
          title: `行為: ${log.behaviour_notes.substring(0, 20)}${log.behaviour_notes.length > 20 ? '...' : ''}`,
          start: date,
          end: date,
          resource: log,
          type: 'behavior',
        });
      }

      if (log.litter_notes) {
        calendarEvents.push({
          id: `${log.id}-litter`,
          title: `排泄: ${log.litter_notes.substring(0, 20)}${log.litter_notes.length > 20 ? '...' : ''}`,
          start: date,
          end: date,
          resource: log,
          type: 'litter',
        });
      }

      // 如果沒有具體資料，建立一般記錄事件
      if (!log.weight_kg && !log.food_gram && !log.behaviour_notes && !log.litter_notes) {
        calendarEvents.push({
          id: `${log.id}-general`,
          title: '健康記錄',
          start: date,
          end: date,
          resource: log,
          type: 'general',
        });
      }
    });

    return calendarEvents;
  }, [healthLogs]);

  // 事件樣式設定
  const eventStyleGetter = (event: HealthLogEvent) => {
    const colors = {
      weight: { backgroundColor: '#22c55e', borderColor: '#16a34a' }, // 綠色
      food: { backgroundColor: '#f59e0b', borderColor: '#d97706' }, // 黃色
      behavior: { backgroundColor: '#3b82f6', borderColor: '#2563eb' }, // 藍色
      litter: { backgroundColor: '#8b5cf6', borderColor: '#7c3aed' }, // 紫色
      general: { backgroundColor: '#6b7280', borderColor: '#4b5563' }, // 灰色
    };

    return {
      style: {
        ...colors[event.type],
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
        fontSize: '12px',
        padding: '2px 4px',
      },
    };
  };

  const handleSelectEvent = (event: HealthLogEvent) => {
    onSelectEvent?.(event);
  };

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    onSelectSlot?.(slotInfo);
  };

  const handleNavigate = (date: Date) => {
    setCurrentDate(date);
    onNavigate?.(date);
  };

  const handleViewChange = (view: View) => {
    setCurrentView(view);
    onView?.(view);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>健康記錄日曆</span>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant={currentView === Views.MONTH ? "default" : "outline"}
              onClick={() => handleViewChange(Views.MONTH)}
            >
              月檢視
            </Button>
            <Button 
              size="sm" 
              variant={currentView === Views.WEEK ? "default" : "outline"}
              onClick={() => handleViewChange(Views.WEEK)}
            >
              週檢視
            </Button>
            <Button 
              size="sm" 
              variant={currentView === Views.DAY ? "default" : "outline"}
              onClick={() => handleViewChange(Views.DAY)}
            >
              日檢視
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* 圖例 */}
        <div className="mb-4 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-green-500"></div>
            <span>體重</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-amber-500"></div>
            <span>飲食</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-blue-500"></div>
            <span>行為</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-purple-500"></div>
            <span>排泄</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-gray-500"></div>
            <span>一般記錄</span>
          </div>
        </div>

        {/* 日曆 */}
        <div style={{ height: '600px' }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            view={currentView}
            views={[Views.MONTH, Views.WEEK, Views.DAY]}
            date={currentDate}
            onNavigate={handleNavigate}
            onView={handleViewChange}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            selectable
            popup
            eventPropGetter={eventStyleGetter}
            messages={{
              next: '下一個',
              previous: '上一個',
              today: '今天',
              month: '月',
              week: '週',
              day: '日',
              agenda: '議程',
              date: '日期',
              time: '時間',
              event: '事件',
              noEventsInRange: '這個時間範圍內沒有事件',
              showMore: (total: number) => `+ 還有 ${total} 個`,
            }}
            formats={{
              dateFormat: 'DD',
              dayFormat: (date: Date, culture?: string, localizer?: any) =>
                localizer?.format(date, 'dddd M/DD', culture) ?? '',
              weekdayFormat: (date: Date, culture?: string, localizer?: any) =>
                localizer?.format(date, 'dddd', culture) ?? '',
              monthHeaderFormat: (date: Date, culture?: string, localizer?: any) =>
                localizer?.format(date, 'YYYY年 M月', culture) ?? '',
              dayHeaderFormat: (date: Date, culture?: string, localizer?: any) =>
                localizer?.format(date, 'YYYY年 M月 DD日 dddd', culture) ?? '',
              dayRangeHeaderFormat: ({ start, end }: { start: Date; end: Date }, culture?: string, localizer?: any) =>
                `${localizer?.format(start, 'M月DD日', culture)} - ${localizer?.format(end, 'M月DD日', culture)}`,
            }}
            className="rounded-lg border"
          />
        </div>
      </CardContent>
    </Card>
  );
}