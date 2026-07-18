"use client";

import type { PendingImageItem } from "@/components/admin/product-images/types";

type Props = {
  item: PendingImageItem;
  disabled: boolean;
  onAltTextChange: (id: string, altText: string) => void;
  onRemove: (id: string) => void;
};

const formatFileSize = (bytes: number) => bytes >= 1024 * 1024
  ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  : `${Math.max(1, Math.round(bytes / 1024))} KB`;

export default function PendingImagePreview({ item, disabled, onAltTextChange, onRemove }: Props) {
  const error = item.validationError || item.uploadError;
  return <article className={`grid gap-4 rounded-2xl border p-4 sm:grid-cols-[120px_1fr_auto] ${error ? "border-red-300 bg-red-50/40" : item.status === "success" ? "border-emerald-300 bg-emerald-50/40" : "border-slate-200"}`}>
    <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-slate-100">
      {item.previewUrl ? <img src={item.previewUrl} alt="Local upload preview" className="h-full w-full object-contain" /> : <span className="px-2 text-center text-xs text-slate-500">Preview unavailable</span>}
    </div>
    <div className="min-w-0">
      <p className="truncate font-bold text-[var(--dark-navy)]" title={item.file.name}>{item.file.name}</p>
      <p className="mt-1 text-xs text-slate-500">{formatFileSize(item.file.size)}</p>
      <label className="form-label mt-3">Alt text
        <input
          value={item.altText}
          maxLength={180}
          disabled={disabled || Boolean(item.validationError)}
          onChange={(event) => onAltTextChange(item.id, event.target.value)}
          className="form-control"
        />
      </label>
      {error ? <p className="mt-2 text-sm font-semibold text-red-700" role="alert">{error}</p> : null}
      {item.status === "uploading" ? <p className="mt-2 text-sm font-semibold text-blue-700">Uploading…</p> : null}
      {item.status === "success" ? <p className="mt-2 text-sm font-semibold text-emerald-700">Uploaded successfully</p> : null}
    </div>
    <button type="button" disabled={disabled} onClick={() => onRemove(item.id)} className="self-start text-sm font-bold text-red-700 disabled:cursor-not-allowed disabled:opacity-50">Remove</button>
  </article>;
}
