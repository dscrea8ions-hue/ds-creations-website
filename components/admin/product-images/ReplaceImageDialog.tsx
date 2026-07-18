"use client";

import { useEffect, useRef, useState } from "react";
import type { SavedProductImage } from "@/components/admin/product-images/types";
import { ALLOWED_PRODUCT_IMAGE_TYPES, MAX_PRODUCT_IMAGE_BYTES } from "@/lib/product-images/constants";

type ReplacementResult = { success: true } | { success: false; error: string };
type Props = {
  image: SavedProductImage;
  disabled: boolean;
  onClose: () => void;
  onConfirm: (file: File, altText: string) => Promise<ReplacementResult>;
};

export default function ReplaceImageDialog({ image, disabled, onClose, onConfirm }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<string | undefined>(undefined);
  const [file, setFile] = useState<File>();
  const [previewUrl, setPreviewUrl] = useState<string>();
  const [altText, setAltText] = useState(image.altText);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const revokePreview = () => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = undefined;
    setPreviewUrl(undefined);
  };

  useEffect(() => {
    dialogRef.current?.showModal();
    return () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    };
  }, []);

  const selectFiles = (files: FileList | File[]) => {
    const selected = Array.from(files);
    revokePreview();
    setFile(undefined);
    if (selected.length !== 1) {
      setError("Choose exactly one replacement image.");
      return;
    }
    const nextFile = selected[0];
    if (!(ALLOWED_PRODUCT_IMAGE_TYPES as readonly string[]).includes(nextFile.type)) {
      setError("Unsupported file type. Select a JPEG, PNG or WebP image.");
      return;
    }
    const objectUrl = URL.createObjectURL(nextFile);
    previewRef.current = objectUrl;
    setPreviewUrl(objectUrl);
    if (nextFile.size === 0) {
      setError("The selected file is empty.");
      return;
    }
    if (nextFile.size > MAX_PRODUCT_IMAGE_BYTES) {
      setError("This image exceeds the 5 MB limit.");
      return;
    }
    setFile(nextFile);
    setError("");
  };

  const close = (force = false) => {
    if (isSubmitting && !force) return;
    revokePreview();
    dialogRef.current?.close();
    onClose();
  };

  const confirm = async () => {
    if (!file || error || isSubmitting || disabled) return;
    setIsSubmitting(true);
    setError("");
    try {
      const result = await onConfirm(file, altText);
      if (result.success) close(true);
      else setError(result.error);
    } catch {
      setError("Replacement request failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return <dialog
    ref={dialogRef}
    aria-labelledby="replace-image-title"
    className="m-auto w-[min(92vw,640px)] rounded-2xl p-0 shadow-2xl backdrop:bg-slate-950/60"
    onCancel={(event) => { event.preventDefault(); close(); }}
    onClick={(event) => { if (event.target === event.currentTarget) close(); }}
  >
    <div className="p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4"><div><h2 id="replace-image-title" className="text-xl font-black text-[var(--dark-navy)]">Replace image</h2><p className="mt-1 text-sm text-slate-500">The image position and primary status will be preserved.</p></div><button type="button" disabled={isSubmitting} onClick={() => close()} className="text-sm font-bold text-slate-600 disabled:opacity-50">Close</button></div>
      <div
        className="mt-5 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-5 text-center"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => { event.preventDefault(); if (!isSubmitting && !disabled) selectFiles(event.dataTransfer.files); }}
      >
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={isSubmitting || disabled} onChange={(event) => { if (event.target.files) selectFiles(event.target.files); event.target.value = ""; }} />
        <p className="font-bold text-[var(--dark-navy)]">Drop one replacement image here</p><p className="mt-1 text-sm text-slate-500">JPEG, PNG or WebP · maximum 5 MB</p>
        <button type="button" disabled={isSubmitting || disabled} onClick={() => inputRef.current?.click()} className="btn-secondary mt-3 px-4 py-2 disabled:opacity-50">Choose replacement</button>
      </div>
      {previewUrl ? <div className="mt-5 grid gap-4 sm:grid-cols-[160px_1fr]"><div className="aspect-square overflow-hidden rounded-xl bg-slate-100"><img src={previewUrl} alt="Replacement preview" className="h-full w-full object-contain" /></div><label className="form-label">Alt text<input value={altText} maxLength={180} disabled={isSubmitting} onChange={(event) => setAltText(event.target.value)} className="form-control" /></label></div> : null}
      {error ? <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-800" role="alert">{error}</p> : null}
      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" disabled={isSubmitting} onClick={() => close()} className="btn-secondary px-5 disabled:opacity-50">Cancel</button><button type="button" disabled={!file || Boolean(error) || isSubmitting || disabled} onClick={confirm} className="btn-gold px-5 disabled:cursor-not-allowed disabled:opacity-50">{isSubmitting ? "Replacing…" : "Confirm replacement"}</button></div>
    </div>
  </dialog>;
}
