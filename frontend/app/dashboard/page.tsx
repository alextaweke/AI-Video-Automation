"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus, Film, Loader2, Sparkles, Clock } from "lucide-react";

import { getUsage, getVideos, UsageSummary } from "@/lib/api";
import { Video } from "@/types/video";
import VideoCard from "@/components/VideoCard";
import ProtectedPage from "@/components/ProtectedPage";
import { useAuth } from "@/components/AuthProvider";
import UsageDashboard from "@/components/UsageDashboard";

export default function DashboardPage() {
  const { isAuthenticated, isReady } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [usage, setUsage] = useState<UsageSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isReady || !isAuthenticated) {
      return;
    }

    let timer: ReturnType<typeof setTimeout>;
    async function loadVideos() {
      try {
        const [data, usageData] = await Promise.all([getVideos(), getUsage()]);

        setVideos(data);
        setUsage(usageData);
        if (
          data.some(
            (video) =>
              !["script_ready", "completed", "failed"].includes(video.status),
          )
        ) {
          timer = setTimeout(loadVideos, 2500);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadVideos();
    return () => clearTimeout(timer);
  }, [isAuthenticated, isReady]);

  // Calculate video stats
  const totalVideos = videos.length;
  const completedVideos = videos.filter((v) => v.status === "completed").length;
  const inProgressVideos = videos.filter(
    (v) => !["script_ready", "completed", "failed"].includes(v.status),
  ).length;

  return (
    <ProtectedPage>
      <main className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-purple-600/20 p-2.5">
                  <Film className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                    Video Dashboard
                  </h1>
                  <p className="mt-0.5 text-sm text-zinc-400">
                    Manage and monitor your AI-generated video content
                  </p>
                </div>
              </div>
            </div>

            <Link
              href="/create"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 px-5 py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-purple-500/25 hover:-translate-y-0.5"
            >
              <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
              Create Video
              <Sparkles className="h-3.5 w-3.5 opacity-60" />
            </Link>
          </div>

          {/* Stats Cards */}
          {!loading && videos.length > 0 && (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  label: "Total Videos",
                  value: totalVideos,
                  icon: Film,
                  color: "text-purple-400",
                },
                {
                  label: "Completed",
                  value: completedVideos,
                  icon: Sparkles,
                  color: "text-green-400",
                },
                {
                  label: "In Progress",
                  value: inProgressVideos,
                  icon: Clock,
                  color: "text-amber-400",
                },
              ].map(({ label, value, icon: Icon, color }) => (
                <div
                  key={label}
                  className="flex items-center gap-4 rounded-xl border border-zinc-800/60 bg-zinc-900/50 px-4 py-3.5 backdrop-blur-sm"
                >
                  <div className={`rounded-lg bg-zinc-800/50 p-2 ${color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-400">{label}</p>
                    <p className="text-2xl font-bold text-white">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Usage Dashboard */}
          {usage && <UsageDashboard usage={usage} />}

          {/* Video Grid */}
          {loading ? (
            <div className="mt-12 flex flex-col items-center justify-center py-16">
              <Loader2 className="h-10 w-10 animate-spin text-purple-400" />
              <p className="mt-4 text-sm text-zinc-400">
                Loading your videos...
              </p>
            </div>
          ) : videos.length === 0 ? (
            <div className="mt-10 rounded-2xl border-2 border-dashed border-zinc-800/60 bg-zinc-900/30 p-12 sm:p-16 text-center backdrop-blur-sm transition-colors hover:border-zinc-700/60">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-purple-600/10">
                <Film className="h-10 w-10 text-purple-400" />
              </div>
              <h2 className="text-2xl font-semibold text-white">
                No videos yet
              </h2>
              <p className="mt-2 text-zinc-400 max-w-md mx-auto">
                Get started by creating your first AI-powered video with our
                advanced generation tools.
              </p>
              <Link
                href="/create"
                className="group mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 px-6 py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-purple-500/25 hover:-translate-y-0.5"
              >
                <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
                Create Your First Video
              </Link>
            </div>
          ) : (
            <>
              <div className="mt-10 flex items-center justify-between border-b border-zinc-800/60 pb-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Your Videos
                  </h2>
                  <p className="text-sm text-zinc-400">
                    {totalVideos} video{totalVideos !== 1 ? "s" : ""} •{" "}
                    {completedVideos} completed
                  </p>
                </div>
                <span className="rounded-full bg-purple-500/10 px-3 py-1 text-xs text-purple-300">
                  {inProgressVideos > 0 && `${inProgressVideos} generating`}
                </span>
              </div>
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {videos.map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </ProtectedPage>
  );
}
