"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { PublicProductImage } from "@/types/product";

type Props = { images: PublicProductImage[]; productName: string };

export default function ProductGallery({ images, productName }: Props) {
  const safeImages = images.length ? images : [{ id: "safe-placeholder", url: "/products/corporate.svg", altText: productName, isPrimary: true, sortOrder: 0 }];
  const [activeId, setActiveId] = useState(safeImages[0].id);
  useEffect(() => { setActiveId(safeImages[0].id); }, [safeImages[0].id]);
  const activeImage = safeImages.find((image) => image.id === activeId) ?? safeImages[0];

  return <div>
    <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-[var(--light-bg)]">
      <Image
        key={activeImage.id}
        src={activeImage.url}
        alt={activeImage.altText || productName}
        fill
        priority={activeImage.id === safeImages[0].id}
        className="object-contain motion-reduce:transition-none"
        sizes="(max-width: 1024px) 100vw, 50vw"
      />
    </div>
    {safeImages.length > 1 ? <div className="mt-4 flex gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-4 sm:overflow-visible lg:grid-cols-5" aria-label={`${productName} image gallery`}>
      {safeImages.map((image, index) => {
        const selected = image.id === activeImage.id;
        return <button
          key={image.id}
          type="button"
          aria-label={`Show ${image.altText || `${productName} image ${index + 1}`}`}
          aria-current={selected ? "true" : undefined}
          onClick={() => setActiveId(image.id)}
          className={`relative aspect-[4/3] w-28 shrink-0 overflow-hidden rounded-xl border-2 bg-[var(--light-bg)] outline-none focus-visible:ring-4 focus-visible:ring-blue-200 sm:w-auto ${selected ? "border-[var(--royal-blue)] ring-2 ring-blue-100" : "border-slate-200 hover:border-slate-400"}`}
        >
          <Image src={image.url} alt="" fill className="object-cover" sizes="(max-width: 640px) 112px, 140px" />
          <span className="sr-only">{selected ? "Currently selected" : "Select image"}</span>
        </button>;
      })}
    </div> : null}
  </div>;
}
