"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove, rectSortingStrategy, SortableContext, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import {
  deleteProductImage,
  moveProductImage,
  reorderProductImages,
  replaceProductImage,
  setPrimaryImage,
} from "@/app/admin/actions";
import ReplaceImageDialog from "@/components/admin/product-images/ReplaceImageDialog";
import SortableProductImageCard from "@/components/admin/product-images/SortableProductImageCard";
import type { SavedProductImage } from "@/components/admin/product-images/types";

type Props = {
  productId: string;
  images: SavedProductImage[];
  disabled?: boolean;
  onMutationChange?: (active: boolean) => void;
};

export default function SortableImageGrid({ productId, images, disabled = false, onMutationChange }: Props) {
  const router = useRouter();
  const [orderedImages, setOrderedImages] = useState(images);
  const [isMutating, setIsMutating] = useState(false);
  const [replacementImage, setReplacementImage] = useState<SavedProductImage>();
  const [notice, setNotice] = useState<{ type: "success" | "warning" | "error"; message: string }>();
  const interactionsDisabled = disabled || isMutating;
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => { setOrderedImages(images); }, [images]);
  useEffect(() => { onMutationChange?.(isMutating); }, [isMutating, onMutationChange]);

  const startMutation = () => { setIsMutating(true); setNotice(undefined); };
  const finishMutation = () => setIsMutating(false);

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id || interactionsDisabled) return;
    const previous = orderedImages;
    const oldIndex = previous.findIndex((image) => image.id === active.id);
    const newIndex = previous.findIndex((image) => image.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const optimistic = arrayMove(previous, oldIndex, newIndex).map((image, sortOrder) => ({ ...image, sortOrder }));
    setOrderedImages(optimistic);
    startMutation();

    const form = new FormData();
    form.set("productId", productId);
    form.set("orderedImageIds", JSON.stringify(optimistic.map(({ id }) => id)));
    try {
      const result = await reorderProductImages(form);
      if (!result.success) {
        setOrderedImages(previous);
        setNotice({ type: "error", message: result.error });
        router.refresh();
      } else {
        setNotice({ type: "success", message: "Image order saved." });
        router.refresh();
      }
    } catch {
      setOrderedImages(previous);
      setNotice({ type: "error", message: "Image order could not be saved. The previous order was restored." });
      router.refresh();
    } finally {
      finishMutation();
    }
  };

  const runExistingMutation = async (kind: "primary" | "delete" | "up" | "down", image: SavedProductImage) => {
    if (interactionsDisabled) return;
    startMutation();
    const form = new FormData();
    form.set("productId", productId);
    form.set("imageId", image.id);
    try {
      if (kind === "primary") {
        await setPrimaryImage(form);
        setOrderedImages((current) => current.map((item) => ({ ...item, isPrimary: item.id === image.id })));
        setNotice({ type: "success", message: "Primary image updated." });
      } else if (kind === "delete") {
        await deleteProductImage(form);
        setOrderedImages((current) => current.filter((item) => item.id !== image.id).map((item, sortOrder) => ({ ...item, sortOrder })));
        setNotice({ type: "success", message: "Image deleted." });
      } else {
        form.set("direction", kind);
        await moveProductImage(form);
        setOrderedImages((current) => {
          const index = current.findIndex((item) => item.id === image.id);
          const target = kind === "up" ? index - 1 : index + 1;
          return index >= 0 && target >= 0 && target < current.length
            ? arrayMove(current, index, target).map((item, sortOrder) => ({ ...item, sortOrder }))
            : current;
        });
        setNotice({ type: "success", message: `Image moved ${kind}.` });
      }
      router.refresh();
    } catch {
      setNotice({ type: "error", message: "Image update failed. Refresh the page and try again." });
    } finally {
      finishMutation();
    }
  };

  const confirmReplacement = async (file: File, altText: string) => {
    if (!replacementImage || interactionsDisabled) return { success: false as const, error: "Image replacement is currently unavailable." };
    const imageId = replacementImage.id;
    startMutation();
    const form = new FormData();
    form.set("productId", productId);
    form.set("imageId", imageId);
    form.set("file", file);
    form.set("altText", altText);
    try {
      const result = await replaceProductImage(form);
      if (!result.success) return result;
      setOrderedImages((current) => current.map((image) => image.id === imageId ? { ...image, url: result.url, altText: result.altText } : image));
      setNotice({ type: result.warning ? "warning" : "success", message: result.warning ?? "Image replaced successfully." });
      router.refresh();
      return { success: true as const };
    } catch {
      return { success: false as const, error: "Replacement request failed. The original image was preserved." };
    } finally {
      finishMutation();
    }
  };

  if (!orderedImages.length) return <p className="mt-6 rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">No saved product images yet.</p>;

  return <div className="mt-6">
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h3 className="font-black text-[var(--dark-navy)]">Saved images</h3><p className="text-xs text-slate-500">Drag the handle or use the move buttons. With a keyboard, focus a handle, press Space, use arrow keys, then press Space again.</p></div>
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={orderedImages.map(({ id }) => id)} strategy={rectSortingStrategy}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {orderedImages.map((image, index) => <SortableProductImageCard
            key={image.id}
            image={image}
            index={index}
            total={orderedImages.length}
            disabled={interactionsDisabled}
            onDelete={(item) => runExistingMutation("delete", item)}
            onMove={(item, direction) => runExistingMutation(direction, item)}
            onReplace={setReplacementImage}
            onSetPrimary={(item) => runExistingMutation("primary", item)}
          />)}
        </div>
      </SortableContext>
    </DndContext>
    {notice ? <p className={`mt-4 rounded-xl px-4 py-3 text-sm font-semibold ${notice.type === "error" ? "bg-red-50 text-red-800" : notice.type === "warning" ? "bg-amber-50 text-amber-900" : "bg-emerald-50 text-emerald-800"}`} role="status">{notice.message}</p> : null}
    {replacementImage ? <ReplaceImageDialog key={replacementImage.id} image={replacementImage} disabled={disabled} onClose={() => setReplacementImage(undefined)} onConfirm={confirmReplacement} /> : null}
  </div>;
}
