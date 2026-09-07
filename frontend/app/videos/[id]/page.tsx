"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { generateThumbnail, generateVideo, getVideo, mediaUrl } from "@/lib/api";
import { Video } from "@/types/video";
import StatusBadge from "@/components/StatusBadge";
import ProtectedPage from "@/components/ProtectedPage";
import ScriptEditor from "@/components/ScriptEditor";
import GenerationProgress from "@/components/GenerationProgress";
import { useAuth } from "@/components/AuthProvider";

interface Props { params: Promise<{ id: string }> }

export default function VideoPage({ params }: Props) {
  const { isAuthenticated, isReady } = useAuth();
  const [video, setVideo] = useState<Video | null>(null);
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(false);
  const [thumbnailStarting, setThumbnailStarting] = useState(false);
  const loadVideo = useCallback(async () => { const { id } = await params; const data = await getVideo(Number(id)); setVideo(data); return data; }, [params]);
  useEffect(() => { if (!isReady || !isAuthenticated) return; let timer: ReturnType<typeof setTimeout>; const poll = async () => { try { const data = await loadVideo(); if (!["script_ready", "completed", "failed"].includes(data.status)) timer = setTimeout(poll, 2500); } catch (caught) { setError(caught instanceof Error ? caught.message : "Failed to load video"); } }; poll(); return () => clearTimeout(timer); }, [isAuthenticated, isReady, loadVideo]);
  async function startVideo() { if (!video) return; try { setStarting(true); setVideo(await generateVideo(video.id)); } catch (caught) { setError(caught instanceof Error ? caught.message : "Could not start video generation"); } finally { setStarting(false); } }
  async function startThumbnail() { if (!video) return; try { setThumbnailStarting(true); await generateThumbnail(video.id); } catch (caught) { setError(caught instanceof Error ? caught.message : "Could not start thumbnail generation"); } finally { setThumbnailStarting(false); } }
  if (error) return <ProtectedPage><main className="min-h-screen bg-zinc-950 p-10 text-red-400">{error}</main></ProtectedPage>;
  if (!video) return <ProtectedPage><main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">Loading script...</main></ProtectedPage>;
  const drafting = video.status === "script_generating" || video.status === "pending";
  const generating = ["voice_generating", "video_generating", "processing"].includes(video.status);
  return <ProtectedPage><main className="min-h-screen bg-zinc-950 text-white"><div className="mx-auto max-w-5xl px-6 py-12">
    <Link href="/dashboard" className="text-sm text-zinc-400 hover:text-white">← Dashboard</Link>
    <div className="mt-8 flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-3xl font-bold">{video.title}</h1><p className="mt-2 text-zinc-400">{video.topic}</p></div><StatusBadge status={video.status} /></div>
    {drafting && <div className="mt-10 border border-zinc-800 bg-zinc-900 p-8 text-center"><div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-4 border-zinc-700 border-t-purple-500" /><h2 className="text-xl font-semibold">Preparing your script</h2><p className="mt-2 text-sm text-zinc-400">Gemini is creating scenes for your review.</p></div>}
    {video.status === "script_ready" && <><ScriptEditor video={video} onChange={setVideo} onRegenerate={() => loadVideo().catch(() => undefined)} /><div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-zinc-800 pt-6"><p className="text-sm text-zinc-400">When the script feels right, create the voiceover and video scenes.</p><button onClick={startVideo} disabled={starting || video.scenes.length === 0} className="rounded-lg bg-purple-600 px-5 py-3 font-semibold hover:bg-purple-500 disabled:opacity-50">{starting ? "Starting..." : "Generate video"}</button></div></>}
    {generating && <GenerationProgress progress={video.progress} />}
    {video.status === "failed" && <div className="mt-10 border border-red-500/20 bg-red-500/10 p-6"><h2 className="font-semibold text-red-400">Generation failed</h2><p className="mt-2 text-sm text-red-300">{video.error_message}</p></div>}
    {video.voice_url && <div className="mt-6 border border-zinc-800 bg-zinc-900 p-6"><h2 className="mb-4 text-xl font-semibold">Voiceover</h2><audio controls src={mediaUrl(video.voice_url)} className="w-full" />{video.captions_url && <a href={mediaUrl(video.captions_url)} className="mt-4 inline-block text-sm text-purple-300 hover:text-purple-200">Download captions</a>}</div>}
    {video.video_url && <video controls className="mt-6 w-full rounded-lg" src={mediaUrl(video.video_url)} />}
    {video.status === "completed" && <section className="mt-6 border border-zinc-800 bg-zinc-900 p-6"><div className="flex flex-wrap items-center justify-between gap-4"><h2 className="text-xl font-semibold">Thumbnail</h2><button onClick={startThumbnail} disabled={thumbnailStarting} className="rounded-lg border border-purple-500/60 px-4 py-2 text-sm text-purple-300 hover:bg-purple-500/10 disabled:opacity-50">{thumbnailStarting ? "Generating..." : video.thumbnail_url ? "Regenerate Thumbnail" : "Generate Thumbnail"}</button></div>{video.thumbnail_url && <Image src={mediaUrl(video.thumbnail_url)} alt="Generated video thumbnail" width={1280} height={720} className="mt-5 w-full max-w-2xl rounded-lg border border-zinc-800" />}</section>}
  </div></main></ProtectedPage>;
}
