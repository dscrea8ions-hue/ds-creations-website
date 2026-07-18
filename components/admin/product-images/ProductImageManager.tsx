"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { uploadProductImageFromManager } from "@/app/admin/actions";
import ProductImageDropzone from "@/components/admin/product-images/ProductImageDropzone";
import PendingImagePreview from "@/components/admin/product-images/PendingImagePreview";
import SortableImageGrid from "@/components/admin/product-images/SortableImageGrid";
import type { PendingImageItem, SavedProductImage, UploadAreaState } from "@/components/admin/product-images/types";
import { ALLOWED_PRODUCT_IMAGE_TYPES, MAX_PRODUCT_IMAGES, MAX_PRODUCT_IMAGE_BYTES } from "@/lib/product-images/constants";

type Props = { productId: string; productTitle: string; savedImages: SavedProductImage[] };

const fileId = (file: File) => `${file.name}-${file.size}-${file.lastModified}-${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`}`;

export default function ProductImageManager({ productId, productTitle, savedImages }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState<PendingImageItem[]>([]);
  const pendingRef = useRef<PendingImageItem[]>([]);
  const [knownSavedCount, setKnownSavedCount] = useState(savedImages.length);
  const [isUploading, setIsUploading] = useState(false);
  const [isSavedMutation, setIsSavedMutation] = useState(false);
  const [areaState, setAreaState] = useState<UploadAreaState>("idle");
  const [summary, setSummary] = useState("");

  useEffect(() => { pendingRef.current = pending; }, [pending]);
  useEffect(() => { setKnownSavedCount(savedImages.length); }, [savedImages.length]);
  useEffect(() => () => {
    for (const item of pendingRef.current) if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
  }, []);

  const addFiles = (files: File[]) => {
    setSummary("");
    setAreaState("idle");
    setPending((current) => {
      const validPendingCount = current.filter((item) => !item.validationError).length;
      let availableSlots = Math.max(0, MAX_PRODUCT_IMAGES - knownSavedCount - validPendingCount);
      let nextPosition = knownSavedCount + validPendingCount + 1;
      const additions = files.map((file) => {
        let validationError: string | undefined;
        const allowedType = (ALLOWED_PRODUCT_IMAGE_TYPES as readonly string[]).includes(file.type);
        if (!allowedType) validationError = "Unsupported file type. Select a JPEG, PNG or WebP image.";
        else if (file.size === 0) validationError = "The selected file is empty.";
        else if (file.size > MAX_PRODUCT_IMAGE_BYTES) validationError = "This image exceeds the 5 MB limit.";
        else if (availableSlots <= 0) validationError = `Only ${MAX_PRODUCT_IMAGES} images are allowed per product.`;

        const position = nextPosition;
        if (!validationError) {
          availableSlots -= 1;
          nextPosition += 1;
        }
        return {
          id: fileId(file),
          file,
          previewUrl: allowedType ? URL.createObjectURL(file) : undefined,
          altText: `${productTitle} – view ${position}`,
          validationError,
          status: validationError ? "error" as const : "idle" as const,
        };
      });
      if (additions.some((item) => item.validationError)) setAreaState("error");
      return [...current, ...additions];
    });
  };

  const removePending = (id: string) => {
    setPending((current) => {
      const item = current.find((candidate) => candidate.id === id);
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
      return current.filter((candidate) => candidate.id !== id);
    });
    setSummary("");
  };

  const updateAltText = (id: string, altText: string) => {
    setPending((current) => current.map((item) => item.id === id ? { ...item, altText, uploadError: undefined, status: "idle" } : item));
  };

  const uploadSelected = async () => {
    const uploadable = pending.filter((item) => !item.validationError);
    if (!uploadable.length || isUploading) return;

    setIsUploading(true);
    setAreaState("uploading");
    setSummary("");
    const successfulIds = new Set<string>();
    let failedCount = 0;

    for (const item of uploadable) {
      setPending((current) => current.map((candidate) => candidate.id === item.id ? { ...candidate, status: "uploading", uploadError: undefined } : candidate));
      const form = new FormData();
      form.set("productId", productId);
      form.set("file", item.file);
      form.set("altText", item.altText);

      try {
        const result = await uploadProductImageFromManager(form);
        if (result.success) {
          successfulIds.add(item.id);
          setPending((current) => current.map((candidate) => candidate.id === item.id ? { ...candidate, status: "success", uploadError: undefined } : candidate));
        } else {
          failedCount += 1;
          setPending((current) => current.map((candidate) => candidate.id === item.id ? { ...candidate, status: "error", uploadError: result.error } : candidate));
        }
      } catch {
        failedCount += 1;
        setPending((current) => current.map((candidate) => candidate.id === item.id ? { ...candidate, status: "error", uploadError: "Upload request failed. Please retry this image." } : candidate));
      }
    }

    if (successfulIds.size) {
      setPending((current) => {
        for (const item of current) if (successfulIds.has(item.id) && item.previewUrl) URL.revokeObjectURL(item.previewUrl);
        return current.filter((item) => !successfulIds.has(item.id));
      });
      setKnownSavedCount((count) => count + successfulIds.size);
      router.refresh();
    }

    setSummary(`${successfulIds.size} image${successfulIds.size === 1 ? "" : "s"} uploaded${failedCount ? `; ${failedCount} failed and can be retried` : " successfully"}.`);
    setAreaState(failedCount ? "error" : "success");
    setIsUploading(false);
  };

  const uploadableCount = pending.filter((item) => !item.validationError).length;
  const availableCount = Math.max(0, MAX_PRODUCT_IMAGES - knownSavedCount - uploadableCount);
  const mutationInProgress = isUploading || isSavedMutation;

  return <div className="mt-5 space-y-5">
    <ProductImageDropzone disabled={mutationInProgress || availableCount === 0} state={areaState} onFilesSelected={addFiles} />
    <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600">
      <p>{knownSavedCount} saved · {uploadableCount} ready · {availableCount} remaining</p>
      <p>Maximum {MAX_PRODUCT_IMAGES} images total</p>
    </div>
    {pending.length ? <div className="space-y-3">
      <h3 className="font-black text-[var(--dark-navy)]">Selected images</h3>
      {pending.map((item) => <PendingImagePreview key={item.id} item={item} disabled={mutationInProgress} onAltTextChange={updateAltText} onRemove={removePending} />)}
      <button type="button" disabled={mutationInProgress || uploadableCount === 0} onClick={uploadSelected} className="btn-gold w-full px-6 sm:w-auto disabled:cursor-not-allowed disabled:opacity-60">
        {isUploading ? "Uploading…" : `Upload selected images (${uploadableCount})`}
      </button>
    </div> : null}
    {summary ? <p className={`rounded-xl px-4 py-3 text-sm font-semibold ${areaState === "error" ? "bg-red-50 text-red-800" : "bg-emerald-50 text-emerald-800"}`} aria-live="polite">{summary}</p> : null}
    <SortableImageGrid productId={productId} images={savedImages} disabled={isUploading} onMutationChange={setIsSavedMutation} />
  </div>;
}
