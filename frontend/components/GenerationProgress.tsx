import { GenerationProgress as Progress } from "@/types/video";

interface Props {
  progress: Progress;
  compact?: boolean;
}

function ProgressRow({ label, percent, detail }: { label: string; percent: number; detail?: string }) {
  return <div className="grid grid-cols-[minmax(0,1fr)_48px] items-center gap-3">
    <div>
      <div className="mb-1 flex justify-between gap-3 text-sm"><span className="truncate text-zinc-300">{label}</span>{detail && <span className="shrink-0 text-xs text-zinc-500">{detail}</span>}</div>
      <div className="h-2 overflow-hidden rounded-sm bg-zinc-800"><div className="h-full bg-purple-500 transition-all" style={{ width: `${percent}%` }} /></div>
    </div>
    <span className="text-right text-xs text-zinc-400">{percent}%</span>
  </div>;
}

export default function GenerationProgress({ progress, compact = false }: Props) {
  const rows = [
    { label: "Script generation", percent: progress.script },
    { label: "Voice generation", percent: progress.voice },
    ...progress.scenes.map((scene) => ({ label: `Scene ${scene.scene_number}`, percent: scene.percent, detail: scene.retry_count ? `Retry ${scene.retry_count}` : scene.status === "processing" ? "Generating" : undefined })),
    { label: "Final processing", percent: progress.final },
  ];
  return <section className={compact ? "space-y-3" : "mt-8 border border-zinc-800 bg-zinc-900 p-6"}>
    {!compact && <div className="mb-6"><h2 className="text-xl font-semibold">Creating your video</h2><p className="mt-1 text-sm text-zinc-400">Live progress updates as each step completes.</p></div>}
    <div className={compact ? "space-y-2" : "space-y-4"}>{rows.map((row) => <ProgressRow key={row.label} {...row} />)}</div>
  </section>;
}
