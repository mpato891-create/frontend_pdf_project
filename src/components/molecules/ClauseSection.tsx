import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Info, CheckCircle } from "lucide-react";

interface ClauseSectionProps {
  title: string;
  items: string[];
  type: "missing" | "modified" | "additional";
  isArabic?: boolean;
}

export function ClauseSection({
  title,
  items,
  type,
  isArabic,
}: ClauseSectionProps) {
  const config = {
    missing: {
      icon: AlertTriangle,
      color: "text-[#d32f2f]",
      bgColor: "bg-[#ffebee]",
      borderColor: "border-l-[#d32f2f]",
    },
    modified: {
      icon: Info,
      color: "text-[#f57c00]",
      bgColor: "bg-[#fff8e1]",
      borderColor: "border-l-[#f57c00]",
    },
    additional: {
      icon: Info,
      color: "text-[#2196f3]",
      bgColor: "bg-[#e3f2fd]",
      borderColor: "border-l-[#2196f3]",
    },
  };

  const { icon: Icon, color, bgColor, borderColor } = config[type];

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`w-6 h-6 ${color}`} />
        <h3 className={`text-xl font-bold ${color}`}>
          {title} ({items.length})
        </h3>
      </div>

      {items.length > 0 ? (
        <Card className={`p-4 ${bgColor} shadow-lg`}>
          <div className="space-y-3">
            {items.map((item, i) => (
              <div
                key={i}
                className={`p-3 bg-white rounded-lg border-l-4 ${borderColor} shadow-sm`}
              >
                <p className={`${color} font-medium`}>{item}</p>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <Alert className="bg-white">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <AlertDescription className="text-green-600 font-medium">
            {isArabic
              ? "✓ لا توجد بنود في هذا القسم"
              : "✓ No items in this section"}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
