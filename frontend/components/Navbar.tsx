"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Menu,
  X,
  LogOut,
  User,
  LayoutDashboard,
  Plus,
  Sun,
  Moon,
  Sparkles,
  ChevronDown,
} from "lucide-react";

import { useAuth } from "@/components/AuthProvider";
import { useTheme } from "@/components/ThemeProvider";
import { logout } from "@/lib/api";

export default function Navbar() {
  const router = useRouter();
  const { isAuthenticated, signOut, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  async function handleSignOut() {
    await logout();
    signOut();
    router.push("/login");
    setMobileMenuOpen(false);
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-800/60 bg-zinc-950/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
        {/* Logo */}
        <Link
          href="/"
          className="group flex items-center gap-2 text-xl font-bold text-white transition hover:opacity-80"
        >
          <div className="rounded-lg bg-purple-600/15 p-1.5 transition group-hover:bg-purple-600/25">
            <Sparkles className="h-5 w-5 text-purple-400" />
          </div>
          <span>
            AI
            <span className="bg-gradient-to-r from-purple-400 to-purple-300 bg-clip-text text-transparent">
              Video
            </span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1.5 text-sm">
          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-lg p-2 text-zinc-400 transition-all hover:bg-zinc-800/50 hover:text-white"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>

          {isAuthenticated ? (
            <>
              {/* User Info */}
              <div className="mx-1.5 flex items-center gap-2 rounded-lg border border-zinc-800/60 bg-zinc-900/50 px-3 py-1.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-purple-600/30 to-purple-400/30 text-xs font-medium text-purple-300">
                  {user?.username?.charAt(0).toUpperCase() || "U"}
                </div>
                <span className="hidden text-sm text-zinc-300 lg:inline">
                  {user?.username}
                </span>
              </div>

              {/* Navigation Links */}
              <Link
                href="/profile"
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-zinc-400 transition-all hover:bg-zinc-800/50 hover:text-white"
              >
                <User className="h-4 w-4" />
                <span className="hidden lg:inline">Profile</span>
              </Link>

              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-zinc-400 transition-all hover:bg-zinc-800/50 hover:text-white"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden lg:inline">Dashboard</span>
              </Link>

              {/* Create Video Button */}
              <Link
                href="/create"
                className="group ml-1 flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 px-4 py-2 font-medium text-white transition-all hover:shadow-lg hover:shadow-purple-500/25 hover:-translate-y-0.5"
              >
                <Plus className="h-3.5 w-3.5 transition-transform group-hover:rotate-90" />
                <span className="hidden sm:inline">Create Video</span>
                <span className="sm:hidden">Create</span>
              </Link>

              {/* Sign Out */}
              <button
                type="button"
                onClick={handleSignOut}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-zinc-400 transition-all hover:bg-red-500/10 hover:text-red-400"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden lg:inline">Sign Out</span>
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-3 py-2 text-zinc-400 transition-all hover:bg-zinc-800/50 hover:text-white"
              >
                Sign In
              </Link>

              <Link
                href="/register"
                className="rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 px-4 py-2 font-medium text-white transition-all hover:shadow-lg hover:shadow-purple-500/25 hover:-translate-y-0.5"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden rounded-lg p-2 text-zinc-400 transition-all hover:bg-zinc-800/50 hover:text-white"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-zinc-800/60 bg-zinc-950/95 backdrop-blur-xl md:hidden">
          <div className="flex flex-col space-y-1 px-4 py-3">
            {isAuthenticated ? (
              <>
                {/* User Info */}
                <div className="flex items-center gap-3 rounded-xl border border-zinc-800/60 bg-zinc-900/50 px-4 py-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-600/30 to-purple-400/30 text-sm font-medium text-purple-300">
                    {user?.username?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div>
                    <p className="font-medium text-white">{user?.username}</p>
                    <p className="text-xs text-zinc-400">Logged in</p>
                  </div>
                </div>

                {/* Mobile Nav Links */}
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-zinc-300 transition hover:bg-zinc-800/50"
                >
                  <User className="h-5 w-5 text-zinc-400" />
                  Profile
                </Link>

                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-zinc-300 transition hover:bg-zinc-800/50"
                >
                  <LayoutDashboard className="h-5 w-5 text-zinc-400" />
                  Dashboard
                </Link>

                <Link
                  href="/create"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-purple-600/20 to-purple-500/20 px-4 py-3 font-medium text-purple-300 transition hover:bg-purple-600/30"
                >
                  <Plus className="h-5 w-5 text-purple-400" />
                  Create Video
                </Link>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-red-400 transition hover:bg-red-500/10"
                >
                  <LogOut className="h-5 w-5" />
                  Sign Out
                </button>

                {/* Theme Toggle in Mobile */}
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-zinc-400 transition hover:bg-zinc-800/50 hover:text-white"
                >
                  {theme === "dark" ? (
                    <>
                      <Sun className="h-5 w-5" />
                      Light Mode
                    </>
                  ) : (
                    <>
                      <Moon className="h-5 w-5" />
                      Dark Mode
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-zinc-300 transition hover:bg-zinc-800/50"
                >
                  Sign In
                </Link>

                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 px-4 py-3 text-center font-medium text-white transition hover:shadow-lg hover:shadow-purple-500/25"
                >
                  Get Started
                </Link>

                {/* Theme Toggle in Mobile */}
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-zinc-400 transition hover:bg-zinc-800/50 hover:text-white"
                >
                  {theme === "dark" ? (
                    <>
                      <Sun className="h-5 w-5" />
                      Light Mode
                    </>
                  ) : (
                    <>
                      <Moon className="h-5 w-5" />
                      Dark Mode
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
