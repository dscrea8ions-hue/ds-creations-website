"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const router = useRouter();
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setPending(true); setError("");
    const data = new FormData(event.currentTarget);
    const result = await signIn("credentials", { email: data.get("email"), password: data.get("password"), redirect: false });
    setPending(false);
    if (result?.error) { setError("Invalid email or password."); return; }
    router.replace("/admin"); router.refresh();
  };
  return <form onSubmit={submit} className="mt-7 space-y-5">
    <label className="form-label">Admin email<input name="email" type="email" autoComplete="username" required className="form-control" /></label>
    <label className="form-label">Password<input name="password" type="password" autoComplete="current-password" required className="form-control" /></label>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm font-bold text-red-800">{error}</p>}
    <button disabled={pending} className="btn-gold w-full disabled:opacity-60">{pending ? "Signing in…" : "Sign in securely"}</button>
  </form>;
}
