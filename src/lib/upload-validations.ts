import { z } from "zod";

/**
 * File upload validation schemas
 */

// Base file validation schema
export const fileSchema = z.object({
  name: z.string().min(1, "File name is required"),
  size: z.number().min(1, "File cannot be empty"),
  type: z.string().min(1, "File type is required"),
});

export type FileInput = z.infer<typeof fileSchema>;

// Image file validation
export const imageFileSchema = fileSchema
  .refine(
    (file) => {
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "image/svg+xml",
      ];
      return allowedTypes.includes(file.type);
    },
    {
      message: "Invalid image type. Allowed: JPG, PNG, WebP, SVG",
    },
  )
  .refine((file) => file.size <= 4 * 1024 * 1024, {
    message: "Image size must be less than 4MB",
  });

export type ImageFileInput = z.infer<typeof imageFileSchema>;

// Video file validation
export const videoFileSchema = fileSchema
  .refine(
    (file) => {
      const allowedTypes = [
        "video/mp4",
        "video/quicktime",
        "video/x-msvideo",
        "video/webm",
      ];
      return allowedTypes.includes(file.type);
    },
    {
      message: "Invalid video type. Allowed: MP4, MOV, AVI, WebM",
    },
  )
  .refine((file) => file.size <= 6 * 1024 * 1024, {
    message: "Video size must be less than 6MB",
  });

export type VideoFileInput = z.infer<typeof videoFileSchema>;

// Document file validation
export const documentFileSchema = fileSchema
  .refine(
    (file) => {
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];
      return allowedTypes.includes(file.type);
    },
    {
      message:
        "Invalid document type. Allowed: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX",
    },
  )
  .refine((file) => file.size <= 4 * 1024 * 1024, {
    message: "Document size must be less than 4MB",
  });

export type DocumentFileInput = z.infer<typeof documentFileSchema>;

// Upload result schema
export const uploadResultSchema = z.object({
  url: z.string().url("Invalid URL"),
  path: z.string().min(1, "Path is required"),
});

export type UploadResult = z.infer<typeof uploadResultSchema>;

// Upload error schema
export const uploadErrorSchema = z.object({
  message: z.string(),
  code: z.string().optional(),
});

export type UploadError = z.infer<typeof uploadErrorSchema>;

// Combined upload response schema
export const uploadResponseSchema = z.discriminatedUnion("success", [
  z.object({
    success: z.literal(true),
    data: uploadResultSchema,
  }),
  z.object({
    success: z.literal(false),
    error: uploadErrorSchema,
  }),
]);

export type UploadResponse = z.infer<typeof uploadResponseSchema>;

/**
 * Helper function to validate a file object
 */
export function validateFileObject(
  file: File,
  fileType: "image" | "video" | "document",
): { valid: boolean; error?: string } {
  const fileData = {
    name: file.name,
    size: file.size,
    type: file.type,
  };

  let schema;
  switch (fileType) {
    case "image":
      schema = imageFileSchema;
      break;
    case "video":
      schema = videoFileSchema;
      break;
    case "document":
      schema = documentFileSchema;
      break;
    default:
      return { valid: false, error: "Invalid file type specified" };
  }

  const result = schema.safeParse(fileData);
  if (!result.success) {
    return {
      valid: false,
      error: result.error.issues[0]?.message || "Validation failed",
    };
  }

  return { valid: true };
}

/**
 * Helper function to check file extension
 */
export function validateFileExtension(
  fileName: string,
  fileType: "image" | "video" | "document",
): { valid: boolean; error?: string } {
  const extension = "." + fileName.split(".").pop()?.toLowerCase();

  const allowedExtensions = {
    image: [".jpg", ".jpeg", ".png", ".webp", ".svg"],
    video: [".mp4", ".mov", ".avi", ".webm"],
    document: [".pdf", ".doc", ".docx", ".ppt", ".pptx", ".xls", ".xlsx"],
  };

  const allowed = allowedExtensions[fileType];
  if (!allowed.includes(extension)) {
    return {
      valid: false,
      error: `Invalid file extension. Allowed: ${allowed.join(", ")}`,
    };
  }

  return { valid: true };
}
