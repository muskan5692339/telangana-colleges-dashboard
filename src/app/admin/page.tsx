import { AppShell } from "@/components/layout/app-shell";
import { Trail } from "@/components/dashboard/trail";
import { SourceUploadForm } from "@/components/dashboard/source-upload-form";
import { listLiveCohorts } from "@/lib/live-cohorts";
import { readLiveStore } from "@/lib/live-store";

export const dynamic = "force-dynamic";

export default async function AdminUploadPage() {
  const [cohorts, store] = await Promise.all([listLiveCohorts(), readLiveStore()]);

  return (
    <AppShell title="Source files" subtitle="Admin Excel upload">
      <div className="mx-auto w-full max-w-7xl space-y-5 px-4 py-5 md:px-8 md:py-8">
        <Trail items={[{ label: "Cohorts", href: "/cohorts" }, { label: "Source files" }]} />
        <div>
          <h2 className="font-display text-[22px] font-semibold text-[var(--color-navy)] md:text-3xl">
            Upload cohort Excel
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-[var(--color-curie-muted)]">
            Staff replace the live college and student tables from the source workbook. Only
            sheets with a colored Excel tab are imported — uncolored working copies such as
            `_var` are ignored.
          </p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
            <a
              href="/api/templates/source"
              className="inline-flex text-sm font-semibold text-[var(--color-navy)] underline"
            >
              Download source template
            </a>
            <a
              href="/admin/requests"
              className="inline-flex text-sm font-semibold text-[var(--color-navy)] underline"
            >
              Review rename, add, and delete requests
            </a>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {cohorts.map((cohort) => (
            <SourceUploadForm
              key={cohort.id}
              batch={cohort}
              lastFile={
                store.uploads.find((item) => item.batchId === cohort.id)?.fileName ??
                store.batches[cohort.id]?.sourceSheet
              }
            />
          ))}
        </div>
        {store.uploads.length > 0 && (
          <div
            className="rounded-[20px] bg-white p-4 md:p-6"
            style={{ border: "1px solid var(--color-curie-border)", boxShadow: "var(--shadow-card)" }}
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-curie-muted)]">
              Recent uploads
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {store.uploads.map((item) => (
                <li key={`${item.batchId}-${item.uploadedAt}`} className="text-[var(--color-navy)]">
                  <span className="font-semibold">{item.fileName}</span>
                  {" · "}
                  {item.collegeCount} colleges, {item.studentCount} students
                  {" · "}
                  <span className="text-[var(--color-curie-muted)]">
                    {new Date(item.uploadedAt).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </AppShell>
  );
}
