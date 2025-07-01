import { 
  Heart, 
  PawPrint, 
  Calendar, 
  FileText, 
  Settings, 
  Home,
  BarChart3,
  DollarSign
} from "lucide-react"

export const navigation = [
  {
    name: "首頁",
    href: "/",
    icon: Home,
  },
  {
    name: "我的寵物",
    href: "/pets",
    icon: PawPrint,
  },
  {
    name: "健康記錄",
    href: "/health",
    icon: Heart,
  },
  {
    name: "費用紀錄",
    href: "/expenses",
    icon: DollarSign,
  },
  {
    name: "日曆檢視",
    href: "/calendar",
    icon: Calendar,
  },
  {
    name: "醫療記錄",
    href: "/medical-records",
    icon: FileText,
  },
  {
    name: "數據分析",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    name: "設定",
    href: "/settings",
    icon: Settings,
  },
] 