"use client";
import { deleteProduct } from "@/app/admin/actions";

export default function DeleteProductButton({ id }: { id: string }) {
  return <form action={deleteProduct} onSubmit={(event) => { if (!window.confirm("Delete this product and its associated image records? This cannot be undone.")) event.preventDefault(); }}><input type="hidden" name="id" value={id} /><button className="rounded-lg bg-red-700 px-4 py-2 font-bold text-white hover:bg-red-800">Delete product</button></form>;
}
