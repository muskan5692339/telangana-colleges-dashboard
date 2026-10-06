"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { BrandLogo } from "@/components/layout/brand-logo";

export function TopBar({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    toast("Logged out");
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="text-white" style={{ background: "var(--gradient-navy)" }}>
      <div
        className="mx-auto flex min-h-16 w-full items-center justify-between gap-3 px-4 pb-2 pt-3 md:min-h-[86px] md:px-8 md:py-4"
        style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
      >
        <div className="flex min-w-0 items-center gap-3">
          <span className="hidden items-center gap-2 sm:flex">
            <BrandLogo className="h-10 md:h-12" />
            <span className="flex min-w-0 flex-col">
              <span
                className="font-display text-[18px] font-bold tracking-[0.04em] leading-none md:text-[26px]"
                style={{ color: "var(--color-curie-lightblue)" }}
              >
                She for STEM
              </span>
              <span
                className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.12em] md:text-[11px]"
                style={{ color: "var(--color-curie-yellow)" }}
              >
                Telangana Colleges Dashboard
              </span>
            </span>
          </span>
          <div className="min-w-0">
            <h1 className="font-display truncate text-lg font-semibold leading-tight md:text-2xl">
              {title}
            </h1>
            {subtitle && (
              <p
                className="truncate text-[11px] leading-tight md:text-sm"
                style={{ color: "var(--color-curie-lightblue)" }}
              >
                {subtitle}
              </p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={logout}
            className="inline-flex h-12 items-center gap-1.5 rounded-full px-4 text-[13px] font-semibold text-white/90 transition-colors hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Log out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
