"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getVideos } from "@/lib/api";
import { Video } from "@/types/video";
import VideoCard from "@/components/VideoCard";

export default function DashboardPage() {
  const [videos, setVideos] = useState<Video[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadVideos() {
      try {
        const data = await getVideos();

        setVideos(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadVideos();
  }, []);

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Video Dashboard</h1>

            <p className="mt-2 text-zinc-400">
              Manage your AI generated videos.
            </p>
          </div>

          <Link
            href="/create"
            className="rounded-xl bg-purple-600 px-5 py-3 font-semibold transition hover:bg-purple-500"
          >
            + Create Video
          </Link>
        </div>

        {loading ? (
          <div className="mt-12 text-zinc-400">Loading videos...</div>
        ) : videos.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed border-zinc-800 p-12 text-center">
            <h2 className="text-xl font-semibold">No videos yet</h2>

            <p className="mt-2 text-zinc-400">Create your first AI video.</p>

            <Link
              href="/create"
              className="mt-6 inline-block rounded-xl bg-purple-600 px-5 py-3 font-semibold"
            >
              Create Video
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
