import Link from "next/link";
import VideoForm from "@/components/VideoForm";
import ProtectedPage from "@/components/ProtectedPage";

export default function CreatePage() {
  return (
    <ProtectedPage>
      <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link
          href="/dashboard"
          className="text-sm text-zinc-400 hover:text-white"
        >
          ← Back to dashboard
        </Link>

        <div className="mt-8">
          <h1 className="text-4xl font-bold">Create AI Video</h1>

          <p className="mt-3 text-zinc-400">
            Enter a topic and let AI create your video script, voice and video.
          </p>
        </div>

        <div className="mt-10 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <VideoForm />
        </div>
      </div>
      </main>
    </ProtectedPage>
  );
}
