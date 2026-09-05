"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getVideo } from "@/lib/api";
import { Video } from "@/types/video";
import StatusBadge from "@/components/StatusBadge";
import ProtectedPage from "@/components/ProtectedPage";
import { useAuth } from "@/components/AuthProvider";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default function VideoPage({ params }: Props) {
  const { isAuthenticated, isReady } = useAuth();
  const [video, setVideo] = useState<Video | null>(null);

  const [error, setError] = useState("");

  useEffect(() => {
    if (!isReady || !isAuthenticated) {
      return;
    }

    let interval: NodeJS.Timeout;

    async function loadVideo() {
      const { id } = await params;

      try {
        const data = await getVideo(Number(id));

        setVideo(data);

        if (data.status !== "completed" && data.status !== "failed") {
          interval = setTimeout(loadVideo, 3000);
        }
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to load video",
        );
      }
    }

    loadVideo();

    return () => {
      if (interval) {
        clearTimeout(interval);
      }
    };
  }, [isAuthenticated, isReady, params]);

  if (error) {
    return (
      <ProtectedPage>
        <main className="min-h-screen bg-zinc-950 p-10 text-red-400">
          {error}
        </main>
      </ProtectedPage>
    );
  }

  if (!video) {
    return (
      <ProtectedPage>
        <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
          Loading video...
        </main>
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage>
      <main className="min-h-screen bg-zinc-950 text-white">
        <div className="mx-auto max-w-5xl px-6 py-12">
          <Link
            href="/dashboard"
            className="text-sm text-zinc-400 hover:text-white"
          >
            ← Dashboard
          </Link>

        <div className="mt-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{video.title}</h1>

            <p className="mt-2 text-zinc-400">{video.topic}</p>
          </div>

          <StatusBadge status={video.status} />
        </div>

        <div className="mt-10">
          {video.status !== "completed" && video.status !== "failed" && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center">
              <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-4 border-zinc-700 border-t-purple-500" />

              <h2 className="text-xl font-semibold">Creating your video</h2>

              <p className="mt-2 text-sm text-zinc-400">
                Current stage: {video.status.replaceAll("_", " ")}
              </p>
            </div>
          )}

          {video.status === "failed" && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
              <h2 className="font-semibold text-red-400">
                Video generation failed
              </h2>

              <p className="mt-2 text-sm text-red-300">{video.error_message}</p>
            </div>
          )}

          {video.script && (
            <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <h2 className="text-xl font-semibold">Generated Script</h2>

              <p className="mt-4 whitespace-pre-line leading-7 text-zinc-300">
                {video.script}
              </p>
            </div>
          )}

          {video.voice_url && (
            <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <h2 className="mb-4 text-xl font-semibold">Voiceover</h2>

              <audio controls src={video.voice_url} className="w-full" />
            </div>
          )}

          {video.video_url && (
            <div className="mt-6">
              <video
                controls
                className="w-full rounded-2xl"
                src={video.video_url}
              />
            </div>
          )}
        </div>
        </div>
      </main>
    </ProtectedPage>
  );
}
