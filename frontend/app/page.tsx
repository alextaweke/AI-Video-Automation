"use client";

import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Mic,
  Film,
  Zap,
  Play,
  LayoutDashboard,
} from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900 text-white overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-purple-600/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-purple-500/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-purple-400/5 blur-3xl" />
      </div>

      {/* Hero Section */}
      <section className="relative mx-auto max-w-6xl px-4 sm:px-6 pt-16 sm:pt-24 pb-12 sm:pb-16">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-1.5 text-sm text-purple-300 backdrop-blur-sm">
            <Zap className="h-3.5 w-3.5" />
            AI Video Automation
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
            Turn your ideas into
            <span className="bg-gradient-to-r from-purple-400 to-purple-300 bg-clip-text text-transparent">
              {" "}
              AI videos.
            </span>
          </h1>

          <p className="mt-4 sm:mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-zinc-400">
            Generate scripts, voiceovers, and AI videos automatically from a
            simple topic. No editing skills required.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 sm:mt-10 flex flex-wrap gap-3 sm:gap-4">
            <Link
              href="/create"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 px-6 py-3.5 font-semibold text-white transition-all hover:shadow-lg hover:shadow-purple-500/25 hover:-translate-y-0.5"
            >
              <Play className="h-4 w-4 fill-white" />
              Create Your Video
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>

            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-2 rounded-xl border border-zinc-700/60 px-6 py-3.5 font-semibold text-zinc-300 transition-all hover:border-purple-500/30 hover:bg-zinc-800/50 hover:-translate-y-0.5"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
          </div>

          {/* Social Proof */}
          <div className="mt-8 flex items-center gap-6 text-sm text-zinc-500">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-1.5">
                {["#8B5CF6", "#EC4899", "#3B82F6", "#10B981"].map(
                  (color, i) => (
                    <div
                      key={i}
                      className="h-6 w-6 rounded-full border-2 border-zinc-950"
                      style={{ backgroundColor: color }}
                    />
                  ),
                )}
              </div>
              <span>Used by creators</span>
            </div>
            <div className="hidden sm:flex items-center gap-1">
              <span className="text-yellow-400">★★★★★</span>
              <span>4.9/5</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative mx-auto max-w-6xl px-4 sm:px-6 pb-16 sm:pb-24">
        <div className="mb-8 sm:mb-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Everything you need to create
            <span className="text-purple-400"> AI videos</span>
          </h2>
          <p className="mt-2 text-sm sm:text-base text-zinc-400">
            Three powerful AI tools in one seamless workflow
          </p>
        </div>

        <div className="grid gap-4 sm:gap-5 md:grid-cols-3">
          <Feature
            icon={<Sparkles className="h-5 w-5" />}
            title="AI Script"
            description="Generate engaging, well-structured scripts automatically from your topic or prompt."
            gradient="from-purple-500/20 to-purple-600/10"
            iconColor="text-purple-400"
          />

          <Feature
            icon={<Mic className="h-5 w-5" />}
            title="AI Voice"
            description="Turn your script into natural, human-like voice narration with ElevenLabs."
            gradient="from-blue-500/20 to-blue-600/10"
            iconColor="text-blue-400"
          />

          <Feature
            icon={<Film className="h-5 w-5" />}
            title="AI Video"
            description="Generate professional video content from your script and visual prompts."
            gradient="from-pink-500/20 to-pink-600/10"
            iconColor="text-pink-400"
          />
        </div>

        {/* Bottom CTA */}
        <div className="mt-10 sm:mt-14 text-center">
          <Link
            href="/create"
            className="group inline-flex items-center gap-2 rounded-xl border border-zinc-700/60 bg-zinc-900/50 px-6 py-3 text-sm font-medium text-zinc-300 transition-all hover:border-purple-500/30 hover:bg-zinc-800/50 hover:-translate-y-0.5 backdrop-blur-sm"
          >
            Start creating now
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>
    </main>
  );
}

function Feature({
  icon,
  title,
  description,
  gradient,
  iconColor,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
  iconColor: string;
}) {
  return (
    <div className="group relative rounded-2xl border border-zinc-800/60 bg-zinc-900/50 p-6 transition-all hover:border-zinc-700/60 hover:bg-zinc-900/80 hover:-translate-y-1 backdrop-blur-sm">
      {/* Gradient Background */}
      <div
        className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} opacity-0 transition-opacity group-hover:opacity-100`}
      />

      <div className="relative">
        {/* Icon */}
        <div
          className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800/50 ${iconColor} transition-colors group-hover:bg-zinc-800/80`}
        >
          {icon}
        </div>

        {/* Content */}
        <h2 className="text-lg sm:text-xl font-semibold text-white">{title}</h2>
        <p className="mt-2 text-sm sm:text-base leading-relaxed text-zinc-400">
          {description}
        </p>

        {/* Decorative Line */}
        <div className="mt-4 h-0.5 w-8 rounded-full bg-gradient-to-r from-purple-500/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
    </div>
  );
}
