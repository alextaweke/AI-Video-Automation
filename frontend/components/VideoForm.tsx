"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createVideo, getUsage } from "@/lib/api";
import {
  Sparkles,
  Loader2,
  Check,
  ChevronDown,
  Play,
  FileText,
  Music,
  Mic,
  Palette,
  LayoutTemplate,
} from "lucide-react";

const templates = [
  ["tiktok", "TikTok", "9:16", "15-30 sec", 3, "Energetic"],
  ["youtube_shorts", "YouTube Shorts", "9:16", "30-60 sec", 5, "Professional"],
  [
    "instagram_reels",
    "Instagram Reels",
    "9:16",
    "30-60 sec",
    4,
    "Conversational",
  ],
  [
    "youtube_landscape",
    "YouTube Landscape",
    "16:9",
    "2-4 min",
    8,
    "Professional",
  ],
  ["educational", "Educational", "16:9", "2-3 min", 6, "Clear"],
  ["motivational", "Motivational", "9:16", "30-60 sec", 5, "Inspiring"],
  ["news", "News", "16:9", "1-2 min", 6, "Authoritative"],
  ["storytelling", "Storytelling", "9:16", "60-90 sec", 6, "Expressive"],
  [
    "product_advertisement",
    "Product Advertisement",
    "9:16",
    "15-30 sec",
    4,
    "Persuasive",
  ],
] as const;

const visualStyles = [
  "Cinematic",
  "Realistic",
  "Documentary",
  "Anime",
  "3D",
  "Cartoon",
  "Futuristic",
  "News",
  "Luxury",
];
const voices = ["Sarah", "Adam", "Rachel", "Michael", "Custom Voice"];
const backgroundMusicOptions = [
  "None",
  "Cinematic",
  "Dramatic",
  "Motivational",
  "Technology",
  "Documentary",
];

export default function VideoForm() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [template, setTemplate] = useState("youtube_shorts");
  const [visualStyle, setVisualStyle] = useState("Cinematic");
  const [voice, setVoice] = useState("Sarah");
  const [speed, setSpeed] = useState(1);
  const [stability, setStability] = useState(50);
  const [similarity, setSimilarity] = useState(75);
  const [customVoiceId, setCustomVoiceId] = useState("");
  const [backgroundMusic, setBackgroundMusic] = useState("None");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getUsage()
      .then(({ account }) => {
        setVoice(account.preferred_voice || "Sarah");
        setSpeed(Number(account.preferred_voice_settings?.speed ?? 1));
        setStability(Number(account.preferred_voice_settings?.stability ?? 50));
        setSimilarity(
          Number(account.preferred_voice_settings?.similarity ?? 75),
        );
      })
      .catch(() => undefined);
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!topic.trim()) {
      setError("Please enter a topic for your video.");
      return;
    }
    if (voice === "Custom Voice" && !customVoiceId.trim()) {
      setError("Please enter your ElevenLabs voice ID.");
      return;
    }

    try {
      setLoading(true);
      const data = await createVideo(
        title.trim() || "Untitled Video",
        topic.trim(),
        template,
        visualStyle,
        voice,
        {
          speed,
          stability,
          similarity,
          ...(voice === "Custom Voice"
            ? { custom_voice_id: customVoiceId.trim() }
            : {}),
        },
        backgroundMusic,
      );

      if (!data.id) {
        throw new Error("Video ID was not returned by the server.");
      }

      router.push(`/videos/${data.id}`);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to create video",
      );
    } finally {
      setLoading(false);
    }
  }

  const selectedTemplate =
    templates.find(([key]) => key === template) || templates[1];

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Template Selection */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
          <LayoutTemplate className="h-4 w-4 text-purple-400" />
          Template
        </label>
        <div className="mt-2 relative">
          <select
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            className="w-full appearance-none rounded-xl border border-zinc-700/70 bg-zinc-950/80 px-4 py-3.5 text-white outline-none transition focus:border-purple-500/70 focus:ring-2 focus:ring-purple-500/20"
          >
            {templates.map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        </div>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-3">
          {[
            { label: "Aspect", value: selectedTemplate[2] },
            { label: "Duration", value: selectedTemplate[3] },
            { label: "Scenes", value: `${selectedTemplate[4]} scenes` },
            { label: "Voice Style", value: selectedTemplate[5] },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500">
                {label}
              </p>
              <p className="text-sm font-medium text-zinc-300">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Visual Style */}
      <fieldset>
        <legend className="flex items-center gap-2 text-sm font-medium text-zinc-300">
          <Palette className="h-4 w-4 text-pink-400" />
          Visual Style
        </legend>
        <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
          {visualStyles.map((style) => (
            <label
              key={style}
              className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition-all ${
                visualStyle === style
                  ? "border-purple-500/70 bg-purple-500/15 text-white shadow-lg shadow-purple-500/10"
                  : "border-zinc-700/60 text-zinc-400 hover:border-zinc-600 hover:bg-zinc-800/50"
              }`}
            >
              <input
                type="radio"
                name="visual-style"
                value={style}
                checked={visualStyle === style}
                onChange={() => setVisualStyle(style)}
                className="accent-purple-500"
              />
              {style}
              {visualStyle === style && (
                <Check className="ml-auto h-3.5 w-3.5 text-purple-400" />
              )}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Background Music */}
      <fieldset className="border-t border-zinc-800/60 pt-6">
        <legend className="flex items-center gap-2 text-sm font-medium text-zinc-300">
          <Music className="h-4 w-4 text-amber-400" />
          Background Music
        </legend>
        <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
          {backgroundMusicOptions.map((option) => (
            <label
              key={option}
              className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition-all ${
                backgroundMusic === option
                  ? "border-purple-500/70 bg-purple-500/15 text-white shadow-lg shadow-purple-500/10"
                  : "border-zinc-700/60 text-zinc-400 hover:border-zinc-600 hover:bg-zinc-800/50"
              }`}
            >
              <input
                type="radio"
                name="background-music"
                value={option}
                checked={backgroundMusic === option}
                onChange={() => setBackgroundMusic(option)}
                className="accent-purple-500"
              />
              {option}
            </label>
          ))}
        </div>
        {backgroundMusic !== "None" && (
          <p className="mt-3 text-xs text-zinc-500 border-l-2 border-amber-500/30 pl-3">
            Music is mixed beneath the voiceover at 15% volume.
          </p>
        )}
      </fieldset>

      {/* Voice Settings */}
      <fieldset className="border-t border-zinc-800/60 pt-6">
        <legend className="flex items-center gap-2 text-sm font-medium text-zinc-300">
          <Mic className="h-4 w-4 text-blue-400" />
          Voice & Audio Settings
        </legend>
        <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
          {voices.map((voiceOption) => (
            <label
              key={voiceOption}
              className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition-all ${
                voice === voiceOption
                  ? "border-purple-500/70 bg-purple-500/15 text-white shadow-lg shadow-purple-500/10"
                  : "border-zinc-700/60 text-zinc-400 hover:border-zinc-600 hover:bg-zinc-800/50"
              }`}
            >
              <input
                type="radio"
                name="voice"
                value={voiceOption}
                checked={voice === voiceOption}
                onChange={() => setVoice(voiceOption)}
                className="accent-purple-500"
              />
              {voiceOption}
            </label>
          ))}
        </div>

        {voice === "Custom Voice" && (
          <div className="mt-4">
            <label className="mb-1.5 block text-sm font-medium text-zinc-400">
              ElevenLabs Voice ID
            </label>
            <input
              value={customVoiceId}
              onChange={(e) => setCustomVoiceId(e.target.value)}
              placeholder="Enter your saved voice ID"
              className="w-full rounded-xl border border-zinc-700/60 bg-zinc-950/80 px-4 py-3 text-white outline-none transition focus:border-purple-500/70 focus:ring-2 focus:ring-purple-500/20"
            />
          </div>
        )}

        <div className="mt-5 grid gap-5 sm:grid-cols-3">
          {[
            {
              label: "Speed",
              value: speed,
              setter: setSpeed,
              min: 0.5,
              max: 2,
              step: 0.05,
              suffix: "x",
            },
            {
              label: "Stability",
              value: stability,
              setter: setStability,
              min: 0,
              max: 100,
              step: 1,
              suffix: "",
            },
            {
              label: "Similarity",
              value: similarity,
              setter: setSimilarity,
              min: 0,
              max: 100,
              step: 1,
              suffix: "",
            },
          ].map(({ label, value, setter, min, max, step, suffix }) => (
            <div key={label}>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">{label}</span>
                <span className="font-mono text-zinc-300">
                  {value}
                  {suffix}
                </span>
              </div>
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => setter(Number(e.target.value))}
                className="mt-1.5 w-full h-1.5 rounded-full bg-zinc-800 accent-purple-500 cursor-pointer"
              />
            </div>
          ))}
        </div>
      </fieldset>

      {/* Title & Topic */}
      <div className="border-t border-zinc-800/60 pt-6">
        <div className="space-y-5">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
              <FileText className="h-4 w-4 text-zinc-400" />
              Video Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for your video (optional)"
              className="mt-1.5 w-full rounded-xl border border-zinc-700/60 bg-zinc-950/80 px-4 py-3.5 text-white outline-none transition placeholder:text-zinc-600 focus:border-purple-500/70 focus:ring-2 focus:ring-purple-500/20"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
              <Sparkles className="h-4 w-4 text-purple-400" />
              Topic <span className="text-red-400">*</span>
            </label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Describe what your video should be about..."
              rows={4}
              className="mt-1.5 w-full resize-none rounded-xl border border-zinc-700/60 bg-zinc-950/80 px-4 py-3.5 text-white outline-none transition placeholder:text-zinc-600 focus:border-purple-500/70 focus:ring-2 focus:ring-purple-500/20"
            />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-lg">⚠️</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 px-6 py-4 font-semibold text-white transition-all hover:shadow-lg hover:shadow-purple-500/25 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none"
      >
        <span className="relative flex items-center justify-center gap-2">
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Preparing your script...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 fill-white" />
              Create Script Draft
              <Sparkles className="h-4 w-4 opacity-60" />
            </>
          )}
        </span>
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
      </button>
    </form>
  );
}
