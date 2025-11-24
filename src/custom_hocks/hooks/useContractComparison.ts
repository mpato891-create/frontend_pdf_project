import { useState } from "react";
import { compareContracts, translateReport } from "@/api/services/api";

interface ComparisonResult {
  name: string;
  report: string;
  translatedReport: string | null;
  isTranslated: boolean;
  success: boolean;
}

export function useContractComparison() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [comparisons, setComparisons] = useState<ComparisonResult[]>([]);

  const compareAll = async (standard: File, contracts: File[]) => {
    setLoading(true);
    setError("");
    setComparisons([]);

    const results: ComparisonResult[] = [];

    for (const contract of contracts) {
      try {
        const response = await compareContracts(standard, contract);

        results.push({
          name: contract.name,
          report: response.report,
          translatedReport: null,
          isTranslated: false,
          success: true,
        });
      } catch (err: any) {
        console.error("Comparison Error:", err);
        results.push({
          name: contract.name,
          report: `Failed to compare: ${err.message || "Unknown error"}`,
          translatedReport: null,
          isTranslated: false,
          success: false,
        });
      }
    }

    setComparisons(results);
    setLoading(false);
  };

  const translate = async (index: number) => {
    if (!comparisons[index]) return;

    try {
      const currentReport = comparisons[index].report;
      const translatedText = await translateReport(currentReport);

      const updated = [...comparisons];
      updated[index] = {
        ...updated[index],
        translatedReport: translatedText,
        isTranslated: true,
      };

      setComparisons(updated);
    } catch (err: any) {
      console.error("Translation Error:", err);
      setError(`Translation failed: ${err.message}`);
    }
  };

  return {
    loading,
    error,
    comparisons,
    compareAll,
    translate,
  };
}
