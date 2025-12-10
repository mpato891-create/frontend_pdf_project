import { useState, useEffect } from "react";
import { FileUploadZone } from "@/components/molecules/FileUploadZone";
import { FileChip } from "@/components/atoms/FileChip";
import { ComparisonReport } from "@/components/organisms/ComparisonReport";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useContractComparison } from "@/custom_hocks/hooks/useContractComparison";
import {
  ArrowLeftRight,
  Loader2,
  WifiOff,
  CheckCircle,
} from "lucide-react";
import { extractText, checkAPIHealth } from "@/api/services/api";

export default function App() {
  const [standard, setStandard] = useState<File | null>(null);
  const [standardText, setStandardText] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [contracts, setContracts] = useState<File[]>([]);
  const [apiStatus, setApiStatus] = useState<"checking" | "online" | "offline">(
    "checking"
  );

  const { loading, error, comparisons, compareAll, translate } =
    useContractComparison();

  useEffect(() => {
    const checkAPI = async () => {
      const isHealthy = await checkAPIHealth();
      setApiStatus(isHealthy ? "online" : "offline");
    };
    checkAPI();
  }, []);

  const handleStandardUpload = async (files: FileList) => {
    const file = files[0];
    if (!file) return;

    setStandard(file);
    setStandardText(
      "⏳ Waking up API (first request takes 30-90 seconds)...\n\nExtracting text, please wait..."
    );
    setExtracting(true);

    try {
      const text = await extractText(file);
      setStandardText(text || "No readable text found.");
    } catch (err: any) {
      console.error("Extraction Error:", err);

      if (err.message?.includes("timeout")) {
        setStandardText(
          "⚠️ Request timed out.\n\n" +
            "The API is waking up from sleep mode.\n" +
            "Please wait 30 seconds and try again."
        );
      } else if (err.message?.includes("404")) {
        setStandardText(
          "❌ API endpoint not found.\n\n" +
            "Please verify the API is deployed correctly."
        );
      } else {
        setStandardText(`❌ Extraction failed:\n\n${err.message}`);
      }
    } finally {
      setExtracting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2] py-8 md:py-16">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* ✅ Header - Simplified (OCR Button Removed) */}
        <div className="flex justify-center items-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white text-center drop-shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
            Smart Contract Comparator
          </h1>
        </div>

        <p className="text-white/90 text-center mb-6 text-lg max-w-3xl mx-auto">
          Upload your master contract once, then compare unlimited contracts
          instantly
        </p>

        {/* API Status Indicator */}
        <div className="flex justify-center mb-8">
          {apiStatus === "checking" ? (
            <Alert className="bg-white/20 border-white/30 text-white max-w-md">
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>Checking API status...</AlertDescription>
            </Alert>
          ) : apiStatus === "online" ? (
            <Alert className="bg-green-500/20 border-green-500/50 text-white max-w-md">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>API is online and ready ✓</AlertDescription>
            </Alert>
          ) : (
            <Alert className="bg-red-500/20 border-red-500/50 text-white max-w-md">
              <WifiOff className="h-4 w-4" />
              <AlertDescription>
                API is offline. First request may take 60+ seconds to wake up.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="space-y-6">
          {!standard ? (
            <FileUploadZone
              label="Master Contract (Standard Template)"
              description="Upload your standard template"
              onFileSelect={handleStandardUpload}
              multiple={false}
            />
          ) : (
            <>
              <FileChip
                filename={standard.name}
                onRemove={() => {
                  setStandard(null);
                  setStandardText("");
                }}
                variant="success"
              />

              <FileUploadZone
                label="Master Contract Preview"
                description=""
                onFileSelect={() => {}}
                multiple={false}
                previewText={standardText}
                showPreview={true}
              />
            </>
          )}

          <FileUploadZone
            label="Contracts to Compare"
            description={`${contracts.length} contracts selected`}
            onFileSelect={(files) =>
              setContracts([...contracts, ...Array.from(files)])
            }
            multiple
          />

          {contracts.map((file, i) => (
            <FileChip
              key={i}
              filename={file.name}
              onRemove={() =>
                setContracts(contracts.filter((_, idx) => idx !== i))
              }
            />
          ))}

          <Button
            onClick={() => standard && compareAll(standard, contracts)}
            disabled={
              !standard || contracts.length === 0 || loading || extracting
            }
            className="w-full py-8 text-xl font-bold bg-gradient-to-r from-[#2196F3] to-[#21CBF3] hover:from-[#2196F3]/90 hover:to-[#21CBF3]/90 shadow-lg disabled:opacity-50"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                Analyzing Contracts...
              </>
            ) : (
              <>
                <ArrowLeftRight className="w-6 h-6 mr-2" />
                Compare All Contracts Now
              </>
            )}
          </Button>

          {loading && (
            <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 w-3/4 animate-pulse"></div>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {comparisons.length > 0 && (
            <div className="space-y-4 mt-8">
              <h2 className="text-4xl font-bold text-white mb-6">
                Comparison Results
              </h2>

              {comparisons.map((result, i) => (
                <ComparisonReport
                  key={i}
                  contractName={result.name}
                  report={result.report}
                  translatedReport={result.translatedReport}
                  isTranslated={result.isTranslated}
                  isTranslating={false}
                  success={result.success}
                  onTranslate={() => translate(i)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
