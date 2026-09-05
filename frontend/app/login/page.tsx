"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/AuthProvider";
import { login } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    try {
      setLoading(true);
      const auth = await login(username.trim(), password);
      signIn(auth);
      router.push("/dashboard");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to sign in");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-16 text-white">
      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
      >
        <h1 className="text-3xl font-bold">Sign in</h1>
        <p className="mt-2 text-zinc-400">Continue to your video dashboard.</p>

        <div className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Username
            </label>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-purple-500"
              autoComplete="username"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-purple-500"
              autoComplete="current-password"
            />
          </div>
        </div>

        {error && (
          <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <p className="mt-6 text-center text-sm text-zinc-400">
          New here?{" "}
          <Link href="/register" className="text-purple-300 hover:text-white">
            Create an account
          </Link>
        </p>
      </form>
    </main>
  );
}
