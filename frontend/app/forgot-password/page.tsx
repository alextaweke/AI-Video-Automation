"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { requestPasswordReset } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent) { event.preventDefault(); try { setLoading(true); setError(""); const result = await requestPasswordReset(email.trim()); setMessage(result.status); } catch (caught) { setError(caught instanceof Error ? caught.message : "Could not request a password reset"); } finally { setLoading(false); } }
  return <main className="min-h-screen bg-zinc-950 px-6 py-16 text-white"><form onSubmit={submit} className="mx-auto max-w-md border border-zinc-800 bg-zinc-900 p-6"><h1 className="text-3xl font-bold">Reset password</h1><p className="mt-2 text-zinc-400">Enter your account email to receive a reset link.</p><label className="mt-8 block text-sm text-zinc-300">Email<input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-purple-500" /></label>{message && <p className="mt-5 text-sm text-emerald-300">{message}</p>}{error && <p className="mt-5 text-sm text-red-400">{error}</p>}<button disabled={loading} className="mt-6 w-full rounded-lg bg-purple-600 px-5 py-3 font-semibold disabled:opacity-50">{loading ? "Sending..." : "Send reset link"}</button><p className="mt-5 text-center text-sm text-zinc-400"><Link href="/login" className="text-purple-300 hover:text-white">Back to sign in</Link></p></form></main>;
}
