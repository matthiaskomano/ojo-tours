"use server";

import {
  uploadFile,
  deleteFile,
  validateFile,
  FileType,
} from "@/lib/supabase-storage";
import { requireMinimumRole, AuthorizationError } from "@/lib/authorization";
import { validateFileObject } from "@/lib/upload-validations";

/**
 * Upload a file to Supabase Storage
 * Requires ADMIN role or higher
 */
export async function uploadFileToStorage(formData: FormData) {
  try {
    await requireMinimumRole("ADMIN");

    const file = formData.get("file") as File;
    const fileType = formData.get("fileType") as FileType;
    const subfolder = (formData.get("subfolder") as string) || "";

    // Validate file exists
    if (!file) {
      throw new Error("No file provided");
    }

    // Validate file type parameter
    if (!fileType || !["IMAGES", "VIDEOS", "DOCUMENTS"].includes(fileType)) {
      throw new Error("Invalid file type specified");
    }

    // Convert plural to singular for validation functions
    const fileTypeMap: Record<string, "image" | "video" | "document"> = {
      IMAGES: "image",
      VIDEOS: "video",
      DOCUMENTS: "document",
    };
    const normalizedFileType = fileTypeMap[fileType];

    // Client-side validation (double-check on server)
    const validation = validateFileObject(file, normalizedFileType);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Validate using storage utilities
    const storageValidation = validateFile(file, fileType);
    if (!storageValidation.valid) {
      throw new Error(storageValidation.error);
    }

    // Upload to Supabase Storage
    const result = await uploadFile(file, fileType, subfolder);

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Upload failed:", error);
    throw error;
  }
}

/**
 * Delete a file from Supabase Storage
 * Requires ADMIN role or higher
 */
export async function deleteFileFromStorage(path: string) {
  try {
    await requireMinimumRole("ADMIN");

    if (!path) {
      throw new Error("No path provided");
    }

    await deleteFile(path);

    return {
      success: true,
    };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Delete failed:", error);
    throw error;
  }
}

/**
 * Upload multiple files to Supabase Storage
 * Requires ADMIN role or higher
 * Future-ready for batch uploads
 */
export async function uploadMultipleFiles(formData: FormData) {
  try {
    await requireMinimumRole("ADMIN");

    const files = formData.getAll("files") as File[];
    const fileType = formData.get("fileType") as FileType;
    const subfolder = (formData.get("subfolder") as string) || "";

    if (!files || files.length === 0) {
      throw new Error("No files provided");
    }

    if (!fileType || !["IMAGES", "VIDEOS", "DOCUMENTS"].includes(fileType)) {
      throw new Error("Invalid file type specified");
    }

    // Convert plural to singular for validation functions
    const fileTypeMap: Record<string, "image" | "video" | "document"> = {
      IMAGES: "image",
      VIDEOS: "video",
      DOCUMENTS: "document",
    };
    const normalizedFileType = fileTypeMap[fileType];

    const results = await Promise.allSettled(
      files.map(async (file) => {
        const validation = validateFileObject(file, normalizedFileType);
        if (!validation.valid) {
          throw new Error(validation.error);
        }

        const storageValidation = validateFile(file, fileType);
        if (!storageValidation.valid) {
          throw new Error(storageValidation.error);
        }

        return uploadFile(file, fileType, subfolder);
      }),
    );

    const successful = results.filter(
      (r) => r.status === "fulfilled",
    ) as PromiseFulfilledResult<{ url: string; path: string }>[];
    const failed = results.filter(
      (r) => r.status === "rejected",
    ) as PromiseRejectedResult[];

    return {
      success: true,
      data: {
        uploaded: successful.map((r) => r.value),
        failed: failed.map((f) => f.reason.message),
      },
    };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Batch upload failed:", error);
    throw error;
  }
}
