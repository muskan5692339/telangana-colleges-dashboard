import { AppShell } from "@/components/layout/app-shell";
import { Trail } from "@/components/dashboard/trail";
import { ShareLinkList } from "@/components/dashboard/share-link-list";
import { cohortsForStudentView } from "@/lib/cohort-data";
import { listLiveCohorts } from "@/lib/live-cohorts";
import { responderUrl, studentViewUrl } from "@/lib/share";

export const dynamic = "force-dynamic";

export default async function ShareLinksPage() {
  const cohorts = cohortsForStudentView(await listLiveCohorts());
  const studentHub = studentViewUrl();
  const lists = cohorts.map((cohort) => ({
    label: cohort.label,
    rows: cohort.colleges.map((college) => ({
      collegeName: college.name,
      enrolled: college.enrolled,
      url: responderUrl(cohort.slug, college.slug),
    })),
  }));

  return (
    <AppShell title="Share links" subtitle="College responder views">
      <div className="mx-auto w-full max-w-7xl space-y-5 px-4 py-5 md:px-8 md:py-8">
        <Trail
          items={[
            { label: "Cohorts", href: "/cohorts" },
            { label: "Share links" },
          ]}
        />
        <div>
          <h2 className="font-display text-[22px] font-semibold text-[var(--color-navy)] md:text-3xl">
            Student / responder view
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-[var(--color-curie-muted)]">
            Send this one student link. No login. Staff keep using the admin dashboard login.
          </p>
          <p className="mt-3 break-all text-base font-semibold text-[var(--color-navy)]">{studentHub}</p>
          <p className="mt-2 text-sm text-[var(--color-curie-muted)]">
            Direct current-batch tablet enrollment picker: {studentViewUrl("2nd-year-new-batch")}
          </p>
        </div>
        <ShareLinkList cohorts={lists} hubUrl={studentHub} />
      </div>
    </AppShell>
  );
}
