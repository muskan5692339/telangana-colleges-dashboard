import { Suspense } from "react";
import { SideNav } from "@/components/layout/side-nav";
import { TopBar } from "@/components/layout/top-bar";

export function AppShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex min-h-dvh flex-col"
      style={{
        background:
          "radial-gradient(1200px 700px at 15% 10%, rgba(145,216,247,0.18), transparent 60%), radial-gradient(900px 600px at 90% 90%, rgba(255,204,41,0.16), transparent 55%), var(--color-page)",
      }}
    >
      <div className="mx-auto flex w-full min-w-0 flex-1 flex-col bg-[var(--color-page)]">
        <Suspense fallback={<div className="h-14 md:h-[86px]" />}>
          <TopBar title={title} subtitle={subtitle} />
        </Suspense>
        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          <Suspense fallback={null}>
            <SideNav />
          </Suspense>
          <main className="order-1 min-w-0 flex-1 overflow-y-auto md:order-2">{children}</main>
        </div>
      </div>
    </div>
  );
}
