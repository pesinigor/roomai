const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export type ImageValidationError =
  | "MISSING_IMAGE"
  | "INVALID_IMAGE_TYPE"
  | "IMAGE_TOO_LARGE"
  | "EMPTY_FILE";

export interface ImageValidationResult {
  valid: boolean;
  error?: ImageValidationError;
  message?: string;
}

export function validateImageFile(file: File): ImageValidationResult {
  if (file.size === 0) {
    return { valid: false, error: "EMPTY_FILE", message: "The selected file appears to be empty." };
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: "INVALID_IMAGE_TYPE",
      message: "Only JPEG, PNG, and WEBP images are supported.",
    };
  }
  if (file.size > MAX_SIZE_BYTES) {
    return {
      valid: false,
      error: "IMAGE_TOO_LARGE",
      message: "Image must be under 10 MB. Try compressing it first.",
    };
  }
  return { valid: true };
}

export async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
