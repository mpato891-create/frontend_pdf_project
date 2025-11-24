import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Languages,
  Loader2,
  AlertTriangle,
  Info,
  CheckCircle,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ComparisonReportProps {
  contractName: string;
  report: string;
  translatedReport?: string | null;
  isTranslated: boolean;
  isTranslating: boolean;
  success: boolean;
  onTranslate: () => void;
}

interface ParsedReport {
  missing: string[];
  modified: string[];
  additional: string[];
  summary: string[];
  riskLevel: "low" | "medium" | "high" | "critical";
}

export function ComparisonReport({
  contractName,
  report,
  translatedReport,
  isTranslated,
  isTranslating,
  success,
  onTranslate,
}: ComparisonReportProps) {
  const parseReport = (text: string): ParsedReport => {
    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    const sections: ParsedReport = {
      missing: [],
      modified: [],
      additional: [],
      summary: [],
      riskLevel: "low",
    };

    let currentSection: keyof ParsedReport | null = null;

    const fullReport = text.toLowerCase();
    if (fullReport.includes("critical") || fullReport.includes("حرج")) {
      sections.riskLevel = "critical";
    } else if (fullReport.includes("high") || fullReport.includes("عالي")) {
      sections.riskLevel = "high";
    } else if (fullReport.includes("medium") || fullReport.includes("متوسط")) {
      sections.riskLevel = "medium";
    }

    lines.forEach((line) => {
      const lowerLine = line.toLowerCase();

      if (
        lowerLine.includes("missing clause") ||
        lowerLine.includes("البنود المفقودة")
      ) {
        currentSection = "missing";
      } else if (
        lowerLine.includes("modified clause") ||
        lowerLine.includes("البنود المعدلة")
      ) {
        currentSection = "modified";
      } else if (
        lowerLine.includes("additional clause") ||
        lowerLine.includes("البنود الإضافية")
      ) {
        currentSection = "additional";
      } else if (lowerLine.includes("summary") || lowerLine.includes("ملخص")) {
        currentSection = "summary";
      } else if (currentSection && line && !lowerLine.includes("clause")) {
        const cleanLine = line
          .replace(/^[-•*]\s*/, "")
          .replace(/^\d+\.\s*/, "")
          .replace(/\*\*/g, "");

        if (cleanLine) {
          sections[currentSection].push(cleanLine);
        }
      }
    });

    return sections;
  };

  const renderSection = (
    title: string,
    items: string[],
    type: "missing" | "modified" | "additional",
    isArabic: boolean
  ) => {
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
  };

  const renderParsedReport = (text: string, isArabic: boolean = false) => {
    if (!success || text.includes("Failed")) {
      return (
        <Alert variant="destructive">
          <AlertDescription>{text}</AlertDescription>
        </Alert>
      );
    }

    const sections = parseReport(text);

    const riskConfig = {
      low: { color: "bg-[#4caf50]", label: isArabic ? "منخفض" : "Low" },
      medium: { color: "bg-[#ff9800]", label: isArabic ? "متوسط" : "Medium" },
      high: { color: "bg-[#f57c00]", label: isArabic ? "عالي" : "High" },
      critical: { color: "bg-[#d32f2f]", label: isArabic ? "حرج" : "Critical" },
    };

    const riskStyle = riskConfig[sections.riskLevel];

    return (
      <div className="p-6" dir={isArabic ? "rtl" : "ltr"}>
        <div className="text-center mb-6">
          <Badge
            className={`${riskStyle.color} text-white text-xl px-8 py-4 shadow-xl font-bold`}
          >
            <AlertTriangle className="w-5 h-5 mr-2" />
            {isArabic ? "مستوى المخاطر" : "Risk Level"}: {riskStyle.label}
          </Badge>
        </div>

        <div className="space-y-6">
          {renderSection(
            isArabic ? "البنود المفقودة" : "Missing Clauses",
            sections.missing,
            "missing",
            isArabic
          )}

          {renderSection(
            isArabic ? "البنود المعدلة" : "Modified Clauses",
            sections.modified,
            "modified",
            isArabic
          )}

          {renderSection(
            isArabic ? "البنود الإضافية" : "Additional Clauses",
            sections.additional,
            "additional",
            isArabic
          )}

          {sections.summary.length > 0 && (
            <Card className="p-4 bg-gray-50 shadow-lg">
              <h3 className="text-xl font-bold mb-3">
                {isArabic ? "📋 الملخص" : "📋 Summary"}
              </h3>
              <div className="space-y-2">
                {sections.summary.map((line, i) => (
                  <p key={i} className="text-gray-700 leading-relaxed">
                    {line}
                  </p>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className="bg-white/97 shadow-2xl overflow-hidden">
      <Accordion type="single" collapsible>
        <AccordionItem value="result" className="border-none">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center justify-between w-full pr-4">
              <span
                className={`font-bold text-lg ${
                  success ? "text-green-600" : "text-red-600"
                }`}
              >
                {contractName} → {success ? "✓ Success" : "✗ Failed"}
              </span>

              {success && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTranslate();
                  }}
                  disabled={isTranslating}
                  className="bg-gradient-to-r from-[#FF6B6B] to-[#FFA500] hover:from-[#FF6B6B]/90 hover:to-[#FFA500]/90 ml-2"
                >
                  {isTranslating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Translating...
                    </>
                  ) : isTranslated ? (
                    "مترجم ✓"
                  ) : (
                    <>
                      <Languages className="mr-2 h-4 w-4" />
                      ترجم للعربية
                    </>
                  )}
                </Button>
              )}
            </div>
          </AccordionTrigger>

          <AccordionContent>
            {isTranslated && translatedReport ? (
              <div>
                <div className="px-6 py-3 bg-blue-50">
                  <p className="font-bold text-blue-800">
                    النسخة العربية (مترجمة):
                  </p>
                </div>
                {renderParsedReport(translatedReport, true)}

                <hr className="my-6" />

                <div className="px-6 py-3 bg-blue-50">
                  <p className="font-bold text-blue-800">
                    Original English Version:
                  </p>
                </div>
                {renderParsedReport(report, false)}
              </div>
            ) : (
              renderParsedReport(report, false)
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}
