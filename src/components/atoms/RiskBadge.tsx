import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

interface RiskBadgeProps {
  level: "low" | "medium" | "high" | "critical";
  isArabic?: boolean;
}

export function RiskBadge({ level, isArabic = false }: RiskBadgeProps) {
  const riskConfig = {
    low: {
      color: "bg-[#4caf50]",
      label: isArabic ? "منخفض" : "Low",
    },
    medium: {
      color: "bg-[#ff9800]",
      label: isArabic ? "متوسط" : "Medium",
    },
    high: {
      color: "bg-[#f57c00]",
      label: isArabic ? "عالي" : "High",
    },
    critical: {
      color: "bg-[#d32f2f]",
      label: isArabic ? "حرج" : "Critical",
    },
  };

  const config = riskConfig[level];

  return (
    <Badge
      className={`${config.color} text-white text-xl px-8 py-4 shadow-[0_8px_25px_rgba(0,0,0,0.3)] font-bold`}
    >
      <AlertTriangle className="w-5 h-5 mr-2" />
      {isArabic ? "مستوى المخاطر" : "Risk Level"}: {config.label}
    </Badge>
  );
}
