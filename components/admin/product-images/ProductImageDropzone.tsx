"use client";

import { useRef, useState } from "react";
import type { UploadAreaState } from "@/components/admin/product-images/types";

type Props = {
  disabled: boolean;
  state: UploadAreaState;
  onFilesSelected: (files: File[]) => void;
};

const stateClasses: Record<UploadAreaState, string> = {
  idle: "border-slate-300 bg-slate-50 text-slate-600",
  uploading: "border-blue-400 bg-blue-50 text-blue-800",
  success: "border-emerald-400 bg-emerald-50 text-emerald-800",
  error: "border-red-400 bg-red-50 text-red-800",
};

export default function ProductImageDropzone({ disabled, state, onFilesSelected }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const visualState = isDragOver ? "border-[var(--royal-blue)] bg-blue-50 text-[var(--royal-blue)]" : stateClasses[state];

  const selectFiles = (files: FileList | null) => {
    if (!disabled && files?.length) onFilesSelected(Array.from(files));
  };

  return <div
    className={`rounded-2xl border-2 border-dashed p-6 text-center transition sm:p-8 ${visualState} ${disabled ? "cursor-not-allowed opacity-70" : ""}`}
    onDragEnter={(event) => { event.preventDefault(); if (!disabled) setIsDragOver(true); }}
    onDragOver={(event) => { event.preventDefault(); if (!disabled) setIsDragOver(true); }}
    onDragLeave={(event) => { event.preventDefault(); if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsDragOver(false); }}
    onDrop={(event) => {
      event.preventDefault();
      setIsDragOver(false);
      selectFiles(event.dataTransfer.files);
    }}
  >
    <input
      ref={inputRef}
      type="file"
      multiple
      accept="image/jpeg,image/png,image/webp"
      className="sr-only"
      disabled={disabled}
      onChange={(event) => { selectFiles(event.target.files); event.target.value = ""; }}
    />
    <p className="font-black">{isDragOver ? "Drop images here" : state === "uploading" ? "Uploading selected images…" : "Drag product images here"}</p>
    <p className="mt-2 text-sm">JPEG, PNG or WebP · maximum 5 MB each</p>
    <button type="button" disabled={disabled} onClick={() => inputRef.current?.click()} className="btn-secondary mt-4 px-5 py-2 disabled:cursor-not-allowed disabled:opacity-60">
      Choose images
    </button>
  </div>;
}
