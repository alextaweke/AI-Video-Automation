import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="max-w-3xl">
          <div className="mb-6 inline-flex rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-2 text-sm text-purple-300">
            AI Video Automation
          </div>

          <h1 className="text-5xl font-bold leading-tight md:text-7xl">
            Turn your ideas into
            <span className="text-purple-400"> AI videos.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
            Generate scripts, voiceovers and AI videos automatically from a
            simple topic.
          </p>

          <div className="mt-10 flex gap-4">
            <Link
              href="/create"
              className="rounded-xl bg-purple-600 px-6 py-3 font-semibold transition hover:bg-purple-500"
            >
              Create Your Video
            </Link>

            <Link
              href="/dashboard"
              className="rounded-xl border border-zinc-700 px-6 py-3 font-semibold transition hover:bg-zinc-900"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-5 px-6 pb-24 md:grid-cols-3">
        <Feature
          title="AI Script"
          description="Generate engaging scripts automatically from your topic."
        />

        <Feature
          title="AI Voice"
          description="Turn your script into natural voice narration."
        />

        <Feature
          title="AI Video"
          description="Generate video content from your script and prompts."
        />
      </section>
    </main>
  );
}

function Feature({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <div className="mb-5 h-10 w-10 rounded-xl bg-purple-500/10" />

      <h2 className="text-xl font-semibold">{title}</h2>

      <p className="mt-2 leading-6 text-zinc-400">{description}</p>
    </div>
  );
}
