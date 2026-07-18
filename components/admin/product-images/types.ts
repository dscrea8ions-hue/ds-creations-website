export type PendingImageStatus = "idle" | "uploading" | "success" | "error";

export type PendingImageItem = {
  id: string;
  file: File;
  previewUrl?: string;
  altText: string;
  validationError?: string;
  uploadError?: string;
  status: PendingImageStatus;
};

export type UploadAreaState = "idle" | "uploading" | "success" | "error";

export type SavedProductImage = {
  id: string;
  url: string;
  altText: string;
  isPrimary: boolean;
  sortOrder: number;
};
