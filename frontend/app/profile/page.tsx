"use client";

import { FormEvent, useEffect, useState } from "react";

import { useAuth } from "@/components/AuthProvider";
import ProtectedPage from "@/components/ProtectedPage";
import { getUsage, updateProfile } from "@/lib/api";

export default function ProfilePage() {
  const { updateUser, user } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [preferredVoice, setPreferredVoice] = useState("Sarah");
  const [voiceSpeed, setVoiceSpeed] = useState(1);
  const [voiceStability, setVoiceStability] = useState(50);
  const [voiceSimilarity, setVoiceSimilarity] = useState(75);

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

  useEffect(() => {
    getUsage().then(({ account }) => {
      setPreferredVoice(account.preferred_voice || "Sarah");
      setVoiceSpeed(Number(account.preferred_voice_settings?.speed ?? 1));
      setVoiceStability(Number(account.preferred_voice_settings?.stability ?? 50));
      setVoiceSimilarity(Number(account.preferred_voice_settings?.similarity ?? 75));
    }).catch(() => undefined);
  }, []);

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
        preferred_voice: preferredVoice,
        preferred_voice_settings: { speed: voiceSpeed, stability: voiceStability, similarity: voiceSimilarity },
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

              <div className="mt-5 border-t border-zinc-800 pt-5">
                <label className="mb-2 block text-sm font-medium text-zinc-300">Default voice</label>
                <select value={preferredVoice} onChange={(event) => setPreferredVoice(event.target.value)} className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-purple-500">
                  {["Sarah", "Adam", "Rachel", "Michael"].map((voice) => <option key={voice} value={voice}>{voice}</option>)}
                </select>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <label className="text-sm text-zinc-300">Speed <span className="float-right text-zinc-500">{voiceSpeed.toFixed(2)}x</span><input type="range" min="0.5" max="2" step="0.05" value={voiceSpeed} onChange={(event) => setVoiceSpeed(Number(event.target.value))} className="mt-2 w-full accent-purple-500" /></label>
                  <label className="text-sm text-zinc-300">Stability <span className="float-right text-zinc-500">{voiceStability}</span><input type="range" min="0" max="100" value={voiceStability} onChange={(event) => setVoiceStability(Number(event.target.value))} className="mt-2 w-full accent-purple-500" /></label>
                  <label className="text-sm text-zinc-300">Similarity <span className="float-right text-zinc-500">{voiceSimilarity}</span><input type="range" min="0" max="100" value={voiceSimilarity} onChange={(event) => setVoiceSimilarity(Number(event.target.value))} className="mt-2 w-full accent-purple-500" /></label>
                </div>
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
