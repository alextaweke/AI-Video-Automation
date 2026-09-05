"use client";

import { FormEvent, useEffect, useState } from "react";

import { useAuth } from "@/components/AuthProvider";
import ProtectedPage from "@/components/ProtectedPage";
import { updateProfile } from "@/lib/api";

export default function ProfilePage() {
  const { updateUser, user } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    queueMicrotask(() => {
      setFirstName(user.first_name || "");
      setLastName(user.last_name || "");
      setEmail(user.email || "");
    });
  }, [user]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      setLoading(true);
      const response = await updateProfile({
        email: email.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
      });

      updateUser(response.user);
      setMessage("Profile updated.");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ProtectedPage>
      <main className="min-h-screen bg-zinc-950 px-6 py-12 text-white">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="mt-2 text-zinc-400">
            Manage the information attached to your account.
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-[1fr_2fr]">
            <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-600 text-2xl font-bold text-white">
                {user?.username?.slice(0, 1).toUpperCase()}
              </div>

              <h2 className="mt-5 text-xl font-semibold">{user?.username}</h2>
              <p className="mt-1 text-sm text-zinc-400">
                {email || "No email added yet"}
              </p>
            </section>

            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-300">
                    First name
                  </label>
                  <input
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-purple-500"
                    autoComplete="given-name"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-300">
                    Last name
                  </label>
                  <input
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-purple-500"
                    autoComplete="family-name"
                  />
                </div>
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-purple-500"
                  autoComplete="email"
                />
              </div>

              {message && (
                <div className="mt-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">
                  {message}
                </div>
              )}

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
                {loading ? "Saving..." : "Save profile"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </ProtectedPage>
  );
}
