"use client";

import { useRef, useState, useCallback } from "react";
import { Upload, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { validateImageFile } from "@/lib/image-utils";
import { ImagePreview } from "./ImagePreview";

interface UploadZoneProps {
  selectedFile: File | null;
  onFileSelected: (file: File) => void;
  onRemove: () => void;
  validationError?: string;
}

export function UploadZone({
  selectedFile,
  onFileSelected,
  onRemove,
  validationError,
}: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      const result = validateImageFile(file);
      if (!result.valid) {
        // Surface the error via a simple alert — parent will handle via its error state
        alert(result.message);
        return;
      }
      onFileSelected(file);
    },
    [onFileSelected]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      e.target.value = "";
    },
    [handleFile]
  );

  if (selectedFile) {
    return (
      <div className="w-full">
        <ImagePreview file={selectedFile} onRemove={onRemove} />
      </div>
    );
  }

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={handleChange}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className={cn(
          "w-full rounded-2xl border-2 border-dashed p-10 text-center transition-colors duration-200 cursor-pointer",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-muted/50"
        )}
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className={cn(
              "flex h-16 w-16 items-center justify-center rounded-2xl transition-colors",
              isDragging ? "bg-primary/10" : "bg-muted"
            )}
          >
            {isDragging ? (
              <ImageIcon className="h-8 w-8 text-primary" />
            ) : (
              <Upload className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <div>
            <p className="text-base font-semibold text-foreground">
              {isDragging ? "Drop your photo here" : "Upload a room photo"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Drag & drop or click to browse
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              JPEG, PNG, or WEBP · Max 10 MB
            </p>
          </div>
        </div>
      </button>

      {validationError && (
        <p className="mt-2 text-sm text-destructive">{validationError}</p>
      )}
    </div>
  );
}
