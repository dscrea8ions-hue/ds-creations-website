type DownloadCatalogueButtonProps = {
  className?: string;
  label?: string;
  showMessage?: boolean;
};

// No approved catalogue PDF is currently present under public.
const cataloguePdfPath: string | null = null;

export default function DownloadCatalogueButton({
  className = "btn-gold",
  label = "DOWNLOAD CATALOGUE",
  showMessage = false,
}: DownloadCatalogueButtonProps) {
  if (cataloguePdfPath) {
    return (
      <a href={cataloguePdfPath} download className={className}>
        {label}
      </a>
    );
  }

  return (
    <span className="inline-flex flex-col items-start gap-2">
      <button
        type="button"
        disabled
        title="Product catalogue PDF will be available soon."
        className={`${className} cursor-not-allowed opacity-65`}
      >
        {label}
      </button>
      {showMessage && (
        <span className="max-w-xs text-xs leading-5 opacity-75">
          Product catalogue PDF will be available soon.
        </span>
      )}
    </span>
  );
}
