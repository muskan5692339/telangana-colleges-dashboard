"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

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
    <header className="relative text-white" style={{ background: "var(--gradient-navy)" }}>
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-16 -right-10 h-40 w-40 rounded-full opacity-30 blur-3xl"
          style={{ background: "var(--color-curie-lightblue)" }}
        />
        <div
          className="absolute -top-10 left-1/3 h-24 w-24 rounded-full opacity-20 blur-2xl"
          style={{ background: "var(--color-curie-yellow)" }}
        />
      </div>
      <div
        className="relative mx-auto flex min-h-16 w-full items-center justify-between gap-3 px-4 pb-2 pt-3 md:min-h-[86px] md:px-8 md:py-4"
        style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
      >
        <div className="flex min-w-0 items-center gap-3">
          <span className="hidden items-center gap-2 sm:flex">
            <span
              className="grid h-9 w-9 place-items-center rounded-full text-[11px] font-bold md:h-12 md:w-12 md:text-sm"
              style={{
                background: "linear-gradient(135deg, var(--color-curie-lightblue) 0%, #c8ecfb 100%)",
                color: "var(--color-navy)",
              }}
            >
              SfS
            </span>
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
