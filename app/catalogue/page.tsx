import { redirect } from "next/navigation";
import { getActiveCatalogue } from "@/lib/site-assets";

export default async function CatalogueRedirectPage() {
  const catalogue = await getActiveCatalogue();
  redirect(catalogue?.url || "/products");
}
