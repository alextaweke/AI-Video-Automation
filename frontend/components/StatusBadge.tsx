import { VideoStatus } from "@/types/video";

interface Props {
  status: VideoStatus;
}

const statusLabels: Record<VideoStatus, string> = {
  pending: "Pending",
  script_generating: "Generating Script",
  script_ready: "Script Ready",
  voice_generating: "Generating Voice",
  video_generating: "Generating Video",
  processing: "Processing",
  completed: "Completed",
  failed: "Failed",
};

export default function StatusBadge({ status }: Props) {
  const isCompleted = status === "completed";
  const isFailed = status === "failed";

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        isCompleted
          ? "bg-green-500/10 text-green-400"
          : isFailed
            ? "bg-red-500/10 text-red-400"
            : "bg-purple-500/10 text-purple-400"
      }`}
    >
      {statusLabels[status]}
    </span>
  );
}
