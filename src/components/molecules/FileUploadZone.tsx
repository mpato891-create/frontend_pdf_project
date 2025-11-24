import { Button } from "@/components/ui/button";
import { Upload, Eye } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FileUploadZoneProps {
  onFileSelect: (files: FileList) => void;
  multiple?: boolean;
  label: string;
  description?: string;
  previewText?: string;
  showPreview?: boolean;
}

export function FileUploadZone({
  onFileSelect,
  multiple = false,
  label,
  description,
  previewText,
  showPreview = false,
}: FileUploadZoneProps) {
  return (
    <Card className="p-6 backdrop-blur-lg bg-white/15 border-white/20 shadow-2xl rounded-2xl">
      <h3 className="text-2xl font-bold text-white mb-2">{label}</h3>
      {description && <p className="text-white/80 mb-4">{description}</p>}

      <Button
        variant="outline"
        className="w-full py-8 border-2 border-dashed border-white/50 bg-transparent hover:bg-white/5 text-white text-base"
        asChild
      >
        <label>
          <Upload className="w-6 h-6 mr-2" />
          <span className="font-semibold">
            {multiple
              ? "Drop or Select Multiple Contracts"
              : "Upload Master Contract"}
          </span>
          <input
            type="file"
            hidden
            multiple={multiple}
            accept=".pdf,.docx"
            onChange={(e) => e.target.files && onFileSelect(e.target.files)}
          />
        </label>
      </Button>

      {showPreview && previewText && (
        <Accordion
          type="single"
          collapsible
          className="mt-4 bg-white/95 rounded-xl"
        >
          <AccordionItem value="preview" className="border-none">
            <AccordionTrigger className="px-4 text-blue-600 font-bold hover:no-underline">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Preview Master Contract Text
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="max-h-96 overflow-auto p-4 bg-gray-50 rounded-lg font-mono text-sm whitespace-pre-wrap">
                {previewText}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </Card>
  );
}
