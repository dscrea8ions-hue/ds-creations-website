import Image from "next/image";
import Link from "next/link";

export default function BrandLogo({ darkText: _darkText = false }: { darkText?: boolean }) {
  return <Link href="/" aria-label="DS CREATIONS home" className="inline-flex shrink-0 rounded-lg bg-[#f9dce8] p-1 shadow-sm">
    <Image
      src="/images/logo.jpeg"
      alt="DS CREATIONS"
      width={733}
      height={469}
      priority
      className="h-14 w-auto object-contain"
      sizes="120px"
    />
  </Link>;
}
