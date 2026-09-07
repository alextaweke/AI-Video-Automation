"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  Film,
  Mic,
  Palette,
  Settings2,
} from "lucide-react";
import VideoForm from "@/components/VideoForm";
import ProtectedPage from "@/components/ProtectedPage";

export default function CreatePage() {
  return (
    <ProtectedPage>
      <main className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900 text-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-12">
          {/* Back Navigation */}
          <Link
            href="/dashboard"
            className="group inline-flex items-center gap-2 text-sm text-zinc-400 transition-all hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Back to dashboard
          </Link>

          {/* Header Section */}
          <div className="mt-6 sm:mt-8">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-purple-600/20 p-2.5">
                <Sparkles className="h-6 w-6 text-purple-400" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                Create AI Video
              </h1>
            </div>

            <p className="mt-3 text-sm sm:text-base text-zinc-400 max-w-2xl leading-relaxed">
              Choose your format, describe your topic, and let AI generate a
              complete script with visuals and voiceover.
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: Film, label: "9 Templates", color: "text-purple-400" },
              { icon: Mic, label: "11Labs Voice", color: "text-blue-400" },
              {
                icon: Palette,
                label: "8 Visual Styles",
                color: "text-pink-400",
              },
              {
                icon: Settings2,
                label: "Customizable",
                color: "text-amber-400",
              },
            ].map(({ icon: Icon, label, color }) => (
              <div
                key={label}
                className="flex items-center gap-2 rounded-xl border border-zinc-800/60 bg-zinc-900/50 px-3 py-2.5 backdrop-blur-sm"
              >
                <Icon className={`h-4 w-4 ${color}`} />
                <span className="text-xs font-medium text-zinc-300">
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* Form Container */}
          <div className="mt-8 rounded-2xl border border-zinc-800/60 bg-zinc-900/80 p-5 sm:p-8 backdrop-blur-sm shadow-2xl shadow-black/30">
            <VideoForm />
          </div>

          {/* Footer Note */}
          <p className="mt-6 text-center text-xs text-zinc-600">
            By creating a video, you agree to our terms of service and content
            policy.
          </p>
        </div>
      </main>
    </ProtectedPage>
  );
}
