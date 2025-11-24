import { X } from "lucide-react";

interface FileChipProps {
  filename: string;
  onRemove?: () => void;
  variant?: "default" | "success" | "warning";
}

export function FileChip({
  filename,
  onRemove,
  variant = "default",
}: FileChipProps) {
  const variantStyles = {
    default: "from-[#2196F3] to-[#21CBF3]",
    success: "from-[#4ECDC4] to-[#44A08D]",
    warning: "from-[#FE6B8B] to-[#FF8E53]",
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-sm rounded-xl">
      <div
        className={`px-6 py-3 rounded-lg bg-gradient-to-r ${variantStyles[variant]} text-white font-bold shadow-lg`}
      >
        {filename}
      </div>
      {onRemove && (
        <button
          onClick={onRemove}
          className="p-2 rounded-full hover:bg-red-500/20 transition-colors ml-3"
        >
          <X className="w-5 h-5 text-red-400" />
        </button>
      )}
    </div>
  );
}
