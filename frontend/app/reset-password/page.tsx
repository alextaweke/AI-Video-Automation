"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { resetPassword } from "@/lib/api";

export default function ResetPasswordPage() {
  const [resetParams] = useState(() => {
    if (typeof window === "undefined") return { uid: "", token: "" };
    const query = new URLSearchParams(window.location.search);
    return { uid: query.get("uid") || "", token: query.get("token") || "" };
  });
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent) { event.preventDefault(); try { setLoading(true); setError(""); await resetPassword(resetParams.uid, resetParams.token, password); setMessage("Your password has been reset. You can now sign in."); } catch (caught) { setError(caught instanceof Error ? caught.message : "Could not reset password"); } finally { setLoading(false); } }
  return <main className="min-h-screen bg-zinc-950 px-6 py-16 text-white"><form onSubmit={submit} className="mx-auto max-w-md border border-zinc-800 bg-zinc-900 p-6"><h1 className="text-3xl font-bold">Choose a new password</h1><p className="mt-2 text-zinc-400">Set a new password for your account.</p><label className="mt-8 block text-sm text-zinc-300">New password<input type="password" required value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-purple-500" autoComplete="new-password" /></label>{message && <p className="mt-5 text-sm text-emerald-300">{message}</p>}{error && <p className="mt-5 text-sm text-red-400">{error}</p>}<button disabled={loading || !resetParams.uid || !resetParams.token} className="mt-6 w-full rounded-lg bg-purple-600 px-5 py-3 font-semibold disabled:opacity-50">{loading ? "Resetting..." : "Reset password"}</button><p className="mt-5 text-center text-sm text-zinc-400"><Link href="/login" className="text-purple-300 hover:text-white">Back to sign in</Link></p></form></main>;
}
