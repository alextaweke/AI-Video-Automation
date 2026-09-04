"use client";

import Link from "next/link";

import { Video } from "@/types/video";
import StatusBadge from "./StatusBadge";

interface Props {
  video: Video;
}

export default function VideoCard({ video }: Props) {
  return (
    <Link
      href={`/videos/${video.id}`}
      className="block rounded-2xl border border-zinc-800 bg-zinc-900 p-5 transition hover:border-purple-500/50"
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-white">{video.title}</h3>

          <p className="mt-1 line-clamp-2 text-sm text-zinc-400">
            {video.topic}
          </p>
        </div>

        <StatusBadge status={video.status} />
      </div>

      <div className="text-xs text-zinc-500">
        {new Date(video.created_at).toLocaleString()}
      </div>
    </Link>
  );
}
