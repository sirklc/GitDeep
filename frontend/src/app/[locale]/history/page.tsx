"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

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
  created_at: string;
}

export default function HistoryPage() {
  const t = useTranslations("history");
  const router = useRouter();
  const [jobs, setJobs] = useState<JobStatusOut[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<JobStatusOut[]>("/analyze/history")
      .then(setJobs)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) router.push("/login");
        else setError(err instanceof ApiError ? err.detail : String(err));
      });
  }, [router]);

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 pt-12">
      <h1 className="font-display text-3xl font-bold">{t("title")}</h1>

      {error && <p className="mt-6 text-sm text-red-400">{error}</p>}

      {jobs && jobs.length === 0 && (
        <p className="mt-8 text-sm text-muted">{t("empty")}</p>
      )}

      {jobs && jobs.length > 0 && (
        <div className="mt-8 overflow-x-auto rounded-xl border border-border-subtle">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface text-muted">
              <tr>
                <th className="px-4 py-3">{t("colRepo")}</th>
                <th className="px-4 py-3">{t("colStatus")}</th>
                <th className="px-4 py-3">{t("colScore")}</th>
                <th className="px-4 py-3">{t("colDate")}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.job_id} className="border-t border-border-subtle">
                  <td className="px-4 py-3 font-mono">{job.repo}</td>
                  <td className="px-4 py-3">{job.status}</td>
                  <td className="px-4 py-3 font-mono">{job.overall_score ?? "—"}</td>
                  <td className="px-4 py-3 text-muted">
                    {new Date(job.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    {job.status === "completed" && (
                      <Link
                        href={`/reports/${job.job_id}`}
                        className="font-semibold text-accent hover:underline"
                      >
                        {t("viewReport")}
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
