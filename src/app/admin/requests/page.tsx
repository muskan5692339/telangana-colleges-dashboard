import { AppShell } from "@/components/layout/app-shell";
import { Trail } from "@/components/dashboard/trail";
import { AdminRequestList } from "@/components/dashboard/admin-request-list";
import { readLiveStore } from "@/lib/live-store";

export const dynamic = "force-dynamic";

export default async function AdminRequestsPage() {
  const store = await readLiveStore();

  return (
    <AppShell title="Change requests" subtitle="Admin approval">
      <div className="mx-auto w-full max-w-4xl space-y-5 px-4 py-5 md:px-8 md:py-8">
        <Trail
          items={[
            { label: "Cohorts", href: "/cohorts" },
            { label: "Source files", href: "/admin" },
            { label: "Requests" },
          ]}
        />
        <div>
          <h2 className="font-display text-[22px] font-semibold text-[var(--color-navy)] md:text-3xl">
            Approve roster changes
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-[var(--color-curie-muted)] md:text-base">
            Colleges request student name and subject area. Enroll add-requests here by allotting dummy
            email and password. Rename and delete still need approval.
          </p>
        </div>
        <AdminRequestList requests={store.requests ?? []} />
      </div>
    </AppShell>
  );
}
