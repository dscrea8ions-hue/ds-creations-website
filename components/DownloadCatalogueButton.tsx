import type { PublicSiteAsset } from "@/types/site-assets";

type Props = { catalogue: PublicSiteAsset | null; className?: string; label?: string; showMessage?: boolean };
export default function DownloadCatalogueButton({ catalogue, className = "btn-gold", label = "DOWNLOAD CATALOGUE", showMessage = false }: Props) {
  if (catalogue) return <a href={catalogue.url} target="_blank" rel="noopener noreferrer" className={className}>{label}</a>;
  return <span className="inline-flex flex-col items-start gap-2"><button type="button" disabled title="Product catalogue PDF will be available soon." className={`${className} cursor-not-allowed opacity-65`}>{label}</button>{showMessage && <span className="max-w-xs text-xs leading-5 opacity-75">Product catalogue PDF will be available soon.</span>}</span>;
}
