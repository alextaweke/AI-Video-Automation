import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="border-b border-zinc-800 bg-zinc-950">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold text-white">
          AI<span className="text-purple-400">Video</span>
        </Link>

        <div className="flex items-center gap-6 text-sm">
          <Link href="/dashboard" className="text-zinc-300 hover:text-white">
            Dashboard
          </Link>

          <Link
            href="/create"
            className="rounded-lg bg-purple-600 px-4 py-2 font-medium text-white transition hover:bg-purple-500"
          >
            Create Video
          </Link>
        </div>
      </div>
    </nav>
  );
}
