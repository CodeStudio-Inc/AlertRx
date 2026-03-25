"use client";

import { useState, useRef } from "react";
import { Upload, X, File, Image, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatFileSize } from "@/lib/utils/format";
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from "@/lib/validators/upload.schema";
import type { UploadResourceType } from "@/models/Upload";

interface FileUploadProps {
  resourceType?: UploadResourceType;
  patientId?: string;
  onUploadComplete?: (result: {
    uploadId: string;
    secureUrl: string;
    publicId: string;
  }) => void;
  className?: string;
}

export function FileUpload({
  resourceType = "other",
  patientId,
  onUploadComplete,
  className,
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(selected: File) {
    if (!ALLOWED_MIME_TYPES.includes(selected.type)) {
      toast.error("Invalid file type. Only JPEG, PNG, WebP, and PDF allowed.");
      return;
    }
    if (selected.size > MAX_FILE_SIZE) {
      toast.error("File size exceeds 10 MB limit.");
      return;
    }
    setFile(selected);
    if (selected.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(selected);
    } else {
      setPreview(null);
    }
  }

  async function handleUpload() {
    if (!file) return;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("resourceType", resourceType);
      if (patientId) formData.append("patientId", patientId);

      const res = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error ?? "Upload failed");
      }

      toast.success("File uploaded successfully");
      onUploadComplete?.(data.data);
      setFile(null);
      setPreview(null);
    } catch (err: any) {
      toast.error(err.message ?? "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const dropped = e.dataTransfer.files[0];
          if (dropped) handleFile(dropped);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-muted/30"
        )}
      >
        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm font-medium">
          Drop file here or click to browse
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          JPEG, PNG, WebP, PDF — max 10 MB
        </p>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={ALLOWED_MIME_TYPES.join(",")}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
      </div>

      {/* File preview */}
      {file && (
        <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
          {preview ? (
            <img
              src={preview}
              alt="Preview"
              className="h-12 w-12 rounded object-cover"
            />
          ) : (
            <File className="h-10 w-10 text-muted-foreground" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(file.size)}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              setFile(null);
              setPreview(null);
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {file && (
        <Button
          onClick={handleUpload}
          disabled={uploading}
          className="w-full"
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload File
            </>
          )}
        </Button>
      )}
    </div>
  );
}
