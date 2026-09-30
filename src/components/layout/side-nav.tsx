"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, ClipboardList, FileSpreadsheet, LayoutDashboard, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCohortBySlug } from "@/lib/cohort-data";

export function SideNav() {
  const pathname = usePathname();
  const parts = pathname.split("/").filter(Boolean);
  const cohortSlug = parts[0] === "cohorts" ? parts[1] : null;
  const cohort = getCohortBySlug(cohortSlug);
  const collegesHref = cohort ? `/cohorts/${cohort.slug}` : "/cohorts";

  const items = [
    { href: "/cohorts", label: "Cohorts", icon: LayoutDashboard, match: "cohorts" as const },
    { href: collegesHref, label: "Colleges", icon: Building2, match: "colleges" as const },
    { href: "/admin", label: "Upload", icon: FileSpreadsheet, match: "admin" as const },
    { href: "/admin/requests", label: "Requests", icon: ClipboardList, match: "requests" as const },
    { href: "/admin/share", label: "Share", icon: Link2, match: "share" as const },
  ];

  return (
    <nav
      aria-label="Primary"
      className="sticky bottom-0 z-20 order-2 shrink-0 border-t backdrop-blur-md md:order-1 md:top-0 md:w-64 md:self-stretch md:border-r md:border-t-0 md:bg-white/88"
      style={{
        background: "rgba(255,255,255,0.92)",
        borderColor: "var(--color-curie-border)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-around px-2 md:mx-0 md:max-w-none md:flex-col md:justify-start md:gap-2 md:px-4 md:py-6">
        {items.map((item) => {
          const Icon = item.icon;
          const active =
            item.match === "cohorts"
              ? pathname === "/cohorts"
              : item.match === "share"
                ? pathname.startsWith("/admin/share")
                : item.match === "requests"
                ? pathname.startsWith("/admin/requests")
              : item.match === "admin"
                  ? pathname.startsWith("/admin") &&
                    !pathname.startsWith("/admin/share") &&
                    !pathname.startsWith("/admin/requests")
                  : Boolean(cohort) || pathname.includes("/colleges");
          return (
            <li key={item.label} className="flex-1 md:flex-none">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group relative flex min-h-[64px] flex-col items-center justify-center gap-1 py-2 transition-transform active:scale-[0.96] md:min-h-14 md:flex-row md:justify-start md:gap-3 md:rounded-2xl md:px-3 md:py-3.5 md:hover:bg-[var(--color-cream)]",
                )}
                style={{
                  color: active ? "var(--color-navy)" : "var(--color-curie-muted)",
                }}
              >
                <span
                  aria-hidden
                  className="flex h-9 w-14 items-center justify-center rounded-full transition-all duration-200 md:h-10 md:w-10 md:shrink-0"
                  style={{
                    background: active
                      ? "linear-gradient(135deg, var(--color-curie-lightblue) 0%, #c8ecfb 100%)"
                      : "transparent",
                    transform: active ? "translateY(-4px)" : "none",
                    boxShadow: active
                      ? "0 8px 18px -8px rgba(145,216,247,0.85), inset 0 0 0 1px rgba(255,255,255,0.6)"
                      : "none",
                  }}
                >
                  <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.4 : 2} />
                </span>
                <span
                  className="text-[11px] leading-none md:text-sm md:leading-tight"
                  style={{ fontWeight: active ? 700 : 500 }}
                >
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
        <li className="hidden md:mt-6 md:block">
          <div className="rounded-2xl border border-[var(--color-curie-border)] bg-[var(--color-cream)] p-3">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-curie-muted)]">
              <Building2 className="h-3.5 w-3.5" />
              Telangana colleges
            </div>
            <p className="mt-1.5 text-[12px] leading-snug text-[var(--color-navy)]">
              {cohort
                ? `Viewing ${cohort.label}. Change cohort anytime from Cohorts.`
                : "Select the old batch or the current batch to continue."}
            </p>
          </div>
        </li>
      </ul>
    </nav>
  );
}
