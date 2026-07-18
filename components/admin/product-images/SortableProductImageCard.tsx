"use client";

import Image from "next/image";
import { GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { SavedProductImage } from "@/components/admin/product-images/types";

type Props = {
  image: SavedProductImage;
  index: number;
  total: number;
  disabled: boolean;
  onDelete: (image: SavedProductImage) => void;
  onMove: (image: SavedProductImage, direction: "up" | "down") => void;
  onReplace: (image: SavedProductImage) => void;
  onSetPrimary: (image: SavedProductImage) => void;
};

export default function SortableProductImageCard({ image, index, total, disabled, onDelete, onMove, onReplace, onSetPrimary }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging, isOver } = useSortable({ id: image.id, disabled });
  return <article
    ref={setNodeRef}
    style={{ transform: CSS.Transform.toString(transform), transition }}
    className={`relative rounded-xl border bg-white p-3 transition-shadow ${isDragging ? "z-20 border-[var(--royal-blue)] opacity-70 shadow-xl" : isOver ? "border-[var(--gold)] ring-2 ring-amber-100" : "border-slate-200"}`}
  >
    <div className="mb-2 flex items-center justify-between gap-2">
      <button type="button" disabled={disabled} aria-label={`Drag ${image.altText} to reorder`} className="inline-flex cursor-grab items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-xs font-bold text-slate-600 touch-none active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-50" {...attributes} {...listeners}><GripVertical size={16} />Drag</button>
      {image.isPrimary ? <span className="rounded-full bg-[var(--gold)] px-2 py-1 text-xs font-black text-[var(--dark-navy)]">Primary</span> : null}
    </div>
    <div className="relative aspect-square overflow-hidden rounded-lg bg-slate-100"><Image src={image.url} alt={image.altText} fill unoptimized={image.url.startsWith("http")} className="object-contain" /></div>
    <p className="mt-2 line-clamp-1 text-sm font-bold" title={image.altText}>{image.altText}</p><p className="text-xs text-slate-500">Position {index + 1}</p>
    <div className="mt-3 flex flex-wrap gap-x-3 gap-y-2">
      {!image.isPrimary ? <button type="button" disabled={disabled} onClick={() => onSetPrimary(image)} className="text-sm font-bold text-[var(--royal-blue)] disabled:opacity-50">Make primary</button> : null}
      <button type="button" disabled={disabled} onClick={() => onReplace(image)} className="text-sm font-bold text-[var(--royal-blue)] disabled:opacity-50">Replace</button>
      <button type="button" disabled={disabled || index === 0} onClick={() => onMove(image, "up")} className="text-sm font-bold disabled:opacity-40">Move up</button>
      <button type="button" disabled={disabled || index === total - 1} onClick={() => onMove(image, "down")} className="text-sm font-bold disabled:opacity-40">Move down</button>
      <button type="button" disabled={disabled} onClick={() => onDelete(image)} className="text-sm font-bold text-red-700 disabled:opacity-50">Delete</button>
    </div>
  </article>;
}
