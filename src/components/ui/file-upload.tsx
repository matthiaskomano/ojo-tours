"use client";

import { useState, useCallback, useRef } from "react";
import {
  Upload,
  X,
  Image as ImageIcon,
  FileText,
  Video,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { uploadFileToStorage } from "@/actions/uploadActions";

export interface FileUploadProps {
  // Configuration
  accept?: string; // e.g., "image/*", "video/*", ".pdf"
  maxSize?: number; // Max file size in bytes
  fileType?: "image" | "video" | "document";
  subfolder?: string; // Storage subfolder path

  // State
  value?: string; // Current file URL
  onChange?: (url: string) => void; // Callback on upload
  onRemove?: () => void; // Callback on remove

  // UI
  label?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;

  // Features
  showPreview?: boolean;
  showRemove?: boolean;
}

export function FileUpload({
  accept = "image/*",
  maxSize = 4 * 1024 * 1024, // 4MB default
  fileType = "image",
  subfolder = "",
  value,
  onChange,
  onRemove,
  label,
  required = false,
  disabled = false,
  error,
  className,
  showPreview = true,
  showRemove = true,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);
  const [localError, setLocalError] = useState<string | null>(error || null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  // Update preview when value changes
  if (value && value !== previewUrl) {
    setPreviewUrl(value);
  }

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      dragCounterRef.current = 0;

      if (disabled || isUploading) return;

      const files = Array.from(e.dataTransfer.files);
      if (files.length === 0) return;

      const file = files[0];
      await processFile(file);
    },
    [disabled, isUploading],
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      const file = files[0];
      await processFile(file);
    },
    [],
  );

  const processFile = async (file: File) => {
    setLocalError(null);

    // Validate file size
    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
      setLocalError(`File size exceeds ${maxSizeMB}MB limit`);
      return;
    }

    // Validate file type
    if (accept && !file.type.match(accept.replace("*", ".*"))) {
      setLocalError(`Invalid file type. Accepted: ${accept}`);
      return;
    }

    // Create local preview
    if (fileType === "image" && showPreview) {
      const localPreview = URL.createObjectURL(file);
      setPreviewUrl(localPreview);
    }

    // Upload to server
    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const fileTypeMap = {
        image: "IMAGES",
        video: "VIDEOS",
        document: "DOCUMENTS",
      };
      formData.append("fileType", fileTypeMap[fileType] as any);
      if (subfolder) {
        formData.append("subfolder", subfolder);
      }

      // Simulate progress (in real implementation, use upload progress events)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const result = await uploadFileToStorage(formData);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.success && result.data) {
        setPreviewUrl(result.data.url);
        onChange?.(result.data.url);
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setLocalError(error instanceof Error ? error.message : "Upload failed");
      setPreviewUrl(value || null); // Revert to original value
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemove = useCallback(() => {
    setPreviewUrl(null);
    setLocalError(null);
    onRemove?.();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [onRemove]);

  const handleClick = useCallback(() => {
    if (!disabled && !isUploading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled, isUploading]);

  const getIcon = () => {
    switch (fileType) {
      case "image":
        return <ImageIcon className="h-8 w-8" />;
      case "video":
        return <Video className="h-8 w-8" />;
      case "document":
        return <FileText className="h-8 w-8" />;
      default:
        return <Upload className="h-8 w-8" />;
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg transition-all",
          isDragging
            ? "border-primary-gold bg-primary-gold/5"
            : "border-gray-300 hover:border-gray-400",
          disabled && "opacity-50 cursor-not-allowed",
          previewUrl && showPreview ? "p-2" : "p-8",
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || isUploading}
        />

        {previewUrl && showPreview ? (
          <div className="relative group">
            {fileType === "image" ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-48 object-cover rounded-md"
              />
            ) : fileType === "video" ? (
              <video
                src={previewUrl}
                controls
                className="w-full h-48 object-cover rounded-md"
              />
            ) : (
              <div className="w-full h-48 flex items-center justify-center bg-gray-100 rounded-md">
                <FileText className="h-12 w-12 text-gray-400" />
              </div>
            )}

            {showRemove && !disabled && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}

            {isUploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-md">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-white mx-auto mb-2" />
                  <p className="text-white text-sm">
                    Uploading... {uploadProgress}%
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center">
            {isUploading ? (
              <div className="space-y-2">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto" />
                <p className="text-sm text-gray-600">
                  Uploading... {uploadProgress}%
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
                  {getIcon()}
                </div>
                <div className="text-sm text-gray-600">
                  <p className="font-medium">
                    {isDragging ? "Drop file here" : "Drag and drop file here"}
                  </p>
                  <p className="text-gray-500">or click to browse</p>
                </div>
                <p className="text-xs text-gray-400">
                  Max size: {(maxSize / (1024 * 1024)).toFixed(1)}MB
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {(localError || error) && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span>{localError || error}</span>
        </div>
      )}
    </div>
  );
}
