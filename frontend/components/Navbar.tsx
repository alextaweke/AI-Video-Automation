"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/AuthProvider";
import { useTheme } from "@/components/ThemeProvider";
import { logout } from "@/lib/api";

export default function Navbar() {
  const router = useRouter();
  const { isAuthenticated, signOut, user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  async function handleSignOut() {
    await logout();
    signOut();
    router.push("/login");
  }

  return (
    <nav className="border-b border-zinc-800 bg-zinc-950">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold text-white">
          AI<span className="text-purple-400">Video</span>
        </Link>

        <div className="flex items-center gap-6 text-sm">
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-lg border border-zinc-800 px-3 py-2 text-zinc-300 transition hover:text-white"
          >
            {theme === "dark" ? "Light" : "Black"}
          </button>

          {isAuthenticated ? (
            <>
              <span className="hidden text-zinc-500 sm:inline">
                {user?.username}
              </span>

              <Link href="/profile" className="text-zinc-300 hover:text-white">
                Profile
              </Link>

              <Link href="/dashboard" className="text-zinc-300 hover:text-white">
                Dashboard
              </Link>

              <Link
                href="/create"
                className="rounded-lg bg-purple-600 px-4 py-2 font-medium text-white transition hover:bg-purple-500"
              >
                Create Video
              </Link>

              <button
                type="button"
                onClick={handleSignOut}
                className="text-zinc-300 hover:text-white"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-zinc-300 hover:text-white">
                Sign in
              </Link>

              <Link
                href="/register"
                className="rounded-lg bg-purple-600 px-4 py-2 font-medium text-white transition hover:bg-purple-500"
              >
                Create account
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
