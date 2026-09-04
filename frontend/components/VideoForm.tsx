"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { createVideo } from "@/lib/api";

export default function VideoForm() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!title.trim() || !topic.trim()) {
      setError("Please enter a title and topic.");
      return;
    }

    try {
      setLoading(true);

      const result = await createVideo(title, topic);

      router.push(`/videos/${result.video_id}`);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-200">
          Video title
        </label>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Dubai Facts"
          className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-purple-500"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-200">
          Video topic
        </label>

        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          rows={6}
          placeholder="5 surprising facts about Dubai"
          className="w-full resize-none rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-purple-500"
        />
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-purple-600 px-5 py-3 font-semibold text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Starting generation..." : "Generate Video"}
      </button>
    </form>
  );
}
