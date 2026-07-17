import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3">
      <div className="relative flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#D4AF37] bg-white text-2xl font-black text-[#0A3D91] shadow-sm">
        DS
      </div>
      <div>
        <div className="text-xl font-black tracking-[0.08em] text-white">
          DS CREATIONS
        </div>
        <div className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#D4AF37]">
          Your identity, our creation
        </div>
      </div>
    </Link>
  );
}
