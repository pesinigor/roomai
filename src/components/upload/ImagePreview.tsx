"use client";

import { useEffect, useState } from "react";
import { X, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImagePreviewProps {
  file: File;
  onRemove: () => void;
}

export function ImagePreview({ file, onRemove }: ImagePreviewProps) {
  const [objectUrl, setObjectUrl] = useState<string>("");

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);

  return (
    <div className="relative w-full">
      <div className="relative overflow-hidden rounded-xl border border-border bg-muted aspect-video">
        {objectUrl && (
          <img
            src={objectUrl}
            alt="Room preview"
            className="h-full w-full object-cover"
          />
        )}
        {!objectUrl && (
          <div className="flex h-full items-center justify-center">
            <ImageIcon className="h-10 w-10 text-muted-foreground" />
          </div>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="absolute right-2 top-2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background shadow-sm"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Remove image</span>
        </Button>
      </div>
      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
        <ImageIcon className="h-3.5 w-3.5" />
        <span className="truncate">{file.name}</span>
        <span className="shrink-0">{fileSizeMB} MB</span>
      </div>
    </div>
  );
}
