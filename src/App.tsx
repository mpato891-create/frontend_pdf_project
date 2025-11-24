import { useState } from "react";
import { FileUploadZone } from "@/components/molecules/FileUploadZone";
import { FileChip } from "@/components/atoms/FileChip";
import { ComparisonReport } from "@/components/organisms/ComparisonReport";
import { Button } from "@/components/ui/button";
import { useContractComparison } from "@/custom_hocks/hooks/useContractComparison";
import { ArrowLeftRight, Loader2 } from "lucide-react";
import { extractText } from "@/api/services/api";

export default function App() {
  const [standard, setStandard] = useState<File | null>(null);
  const [standardText, setStandardText] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [contracts, setContracts] = useState<File[]>([]);
  const { loading, error, comparisons, compareAll, translate } =
    useContractComparison();

  const handleStandardUpload = async (files: FileList) => {
    const file = files[0];
    if (!file) return;

    setStandard(file);
    setStandardText("Extracting text, please wait...");
    setExtracting(true);

    try {
      const text = await extractText(file);
      setStandardText(text || "No readable text found.");
    } catch (err) {
      console.error("Extraction Error:", err);
      setStandardText("Failed to extract text from the master contract.");
    } finally {
      setExtracting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2] py-8 md:py-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-4xl md:text-6xl font-bold text-white text-center mb-4 drop-shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
          Smart Contract Comparator
        </h1>
        <p className="text-white/90 text-center mb-12 text-lg max-w-3xl mx-auto">
          Upload your master contract once, then compare unlimited contracts
          instantly
        </p>

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
            disabled={!standard || contracts.length === 0 || loading}
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
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 text-white font-semibold">
              {error}
            </div>
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
