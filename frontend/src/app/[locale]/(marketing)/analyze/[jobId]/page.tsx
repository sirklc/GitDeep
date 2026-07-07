"use client";

import { useTranslations } from "next-intl";
import { use, useEffect, useRef, useState } from "react";

import { Link, useRouter } from "@/i18n/navigation";
import { api, ApiError } from "@/lib/api";

interface JobStatusOut {
  job_id: string;
  repo: string;
  status: string;
  progress_step: number;
  progress_total: number;
  progress_message: string;
  overall_score: number | null;
  error_message: string | null;
  credits_charged: number;
}

export default function JobProgressPage({
  params,
}: Readonly<{ params: Promise<{ jobId: string }> }>) {
  const { jobId } = use(params);
  const t = useTranslations("job");
  const router = useRouter();
  const [job, setJob] = useState<JobStatusOut | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    async function poll() {
      try {
        const data = await api.get<JobStatusOut>(`/analyze/${jobId}`);
        setJob(data);
        if (data.status === "completed") {
          if (timer.current) clearInterval(timer.current);
          router.push(`/reports/${jobId}`);
        } else if (data.status === "failed" || data.status === "refunded") {
          if (timer.current) clearInterval(timer.current);
        }
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) router.push("/login");
        else setError(err instanceof ApiError ? err.detail : String(err));
        if (timer.current) clearInterval(timer.current);
      }
    }
    poll();
    timer.current = setInterval(poll, 2000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [jobId, router]);

  const pct = job ? Math.round((job.progress_step / job.progress_total) * 100) : 0;
  const failed = job && (job.status === "failed" || job.status === "refunded");

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 pt-16">
      <h1 className="font-display text-3xl font-bold">{t("title")}</h1>
      {job && <p className="mt-1 font-mono text-muted">{job.repo}</p>}

      {error && <p className="mt-6 text-red-400">{error}</p>}

      {job && !failed && (
        <div className="mt-10">
          <div className="flex justify-between text-sm text-muted">
            <span>
              {t("step", { step: job.progress_step, total: job.progress_total })}
              {job.progress_message && ` — ${job.progress_message}`}
            </span>
            <span className="font-mono">{pct}%</span>
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-surface">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-700"
              style={{ width: `${Math.max(pct, 4)}%` }}
            />
          </div>
          <p className="mt-6 text-sm text-muted">{t("waiting")}</p>
        </div>
      )}

      {failed && (
        <div className="mt-10 rounded-xl border border-red-500/40 bg-red-500/10 p-6">
          <p className="font-semibold text-red-400">{t("failed")}</p>
          {job.error_message && (
            <p className="mt-2 font-mono text-sm text-muted">{job.error_message}</p>
          )}
          <p className="mt-3 text-sm text-accent">
            {t("refunded", { credits: job.credits_charged })}
          </p>
          <Link
            href="/analyze"
            className="mt-4 inline-block rounded-lg bg-primary-strong px-5 py-2 text-sm font-semibold text-white hover:bg-primary"
          >
            {t("tryAgain")}
          </Link>
        </div>
      )}
    </main>
  );
}
