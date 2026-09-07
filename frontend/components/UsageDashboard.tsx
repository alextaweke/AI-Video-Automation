import { UsageSummary } from "@/lib/api";
import {
  TrendingUp,
  Clock,
  CreditCard,
  Video as VideoIcon,
  BarChart3,
} from "lucide-react";

export default function UsageDashboard({ usage }: { usage: UsageSummary }) {
  const maximum = Math.max(...usage.chart.map((point) => point.count), 1);
  const usedCredits = usage.account.credit_limit - usage.credits_remaining;
  const creditPercentage = Math.max(
    0,
    (usedCredits / usage.account.credit_limit) * 100,
  );

  return (
    <section className="mt-8 rounded-2xl border border-zinc-800/60 bg-zinc-900/50 p-5 sm:p-6 backdrop-blur-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-purple-600/15 p-2">
            <BarChart3 className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Usage Overview</h2>
            <p className="text-xs text-zinc-400">
              {usage.account.plan === "pro" ? (
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-purple-400" />
                  Pro Plan
                </span>
              ) : (
                "Free Plan"
              )}{" "}
              · Resets monthly
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-purple-500/10 px-4 py-1.5">
          <CreditCard className="h-3.5 w-3.5 text-purple-400" />
          <span className="text-sm font-medium text-purple-300">
            {usage.credits_remaining} credits remaining
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-800/60 bg-zinc-950/50 p-4 transition-colors hover:border-zinc-700/60">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <VideoIcon className="h-4 w-4" />
            Videos Created
          </div>
          <p className="mt-1.5 text-3xl font-bold text-white">
            {usage.videos_created}
          </p>
          <p className="mt-0.5 text-xs text-zinc-500">
            {usage.account.videos_created_this_month} of{" "}
            {usage.account.monthly_video_limit} this month
          </p>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-purple-400 transition-all"
              style={{
                width: `${Math.min((usage.account.videos_created_this_month / usage.account.monthly_video_limit) * 100, 100)}%`,
              }}
            />
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800/60 bg-zinc-950/50 p-4 transition-colors hover:border-zinc-700/60">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <Clock className="h-4 w-4" />
            Minutes Generated
          </div>
          <p className="mt-1.5 text-3xl font-bold text-white">
            {Number(usage.minutes_generated).toFixed(1)}
          </p>
          <p className="mt-0.5 text-xs text-zinc-500">
            Completed video runtime
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800/60 bg-zinc-950/50 p-4 transition-colors hover:border-zinc-700/60">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <TrendingUp className="h-4 w-4" />
            Credits Usage
          </div>
          <p className="mt-1.5 text-3xl font-bold text-white">
            {usage.credits_remaining}
          </p>
          <p className="mt-0.5 text-xs text-zinc-500">
            {usedCredits} of {usage.account.credit_limit} used
          </p>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-purple-400 transition-all"
              style={{ width: `${creditPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="mt-6">
        <p className="mb-3 text-sm font-medium text-zinc-300">
          Weekly Activity
        </p>
        <div className="flex h-32 items-end gap-1.5 rounded-xl border border-zinc-800/60 bg-zinc-950/50 p-4">
          {usage.chart.map((point) => {
            const height = Math.max(
              point.count ? 10 : 2,
              (point.count / maximum) * 100,
            );
            const date = new Date(`${point.date}T00:00:00`);
            const isToday = date.toDateString() === new Date().toDateString();

            return (
              <div
                key={point.date}
                className="flex flex-1 flex-col items-center gap-2"
              >
                <div
                  className={`w-full rounded-sm transition-all duration-500 ${
                    isToday
                      ? "bg-gradient-to-t from-purple-500 to-purple-400"
                      : "bg-purple-500/60 hover:bg-purple-400/80"
                  }`}
                  style={{ height: `${height}%` }}
                  title={`${point.count} videos on ${point.date}`}
                />
                <span
                  className={`text-[10px] font-medium ${
                    isToday ? "text-purple-400" : "text-zinc-500"
                  }`}
                >
                  {date.toLocaleDateString(undefined, { weekday: "narrow" })}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
