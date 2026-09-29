import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function StudentShell({
  kicker = "She for STEM · Telangana",
  title,
  subtitle,
  backHref,
  backLabel = "Back",
  children,
}: {
  kicker?: string;
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  children: ReactNode;
}) {
  return (
    <div
      className="min-h-dvh"
      style={{
        background:
          "radial-gradient(1200px 700px at 15% 10%, rgba(145,216,247,0.18), transparent 60%), radial-gradient(900px 600px at 90% 90%, rgba(255,204,41,0.16), transparent 55%), var(--color-page)",
      }}
    >
      <header
        className="px-4 py-5 text-white md:px-8 md:py-7"
        style={{ background: "var(--gradient-navy)" }}
      >
        {backHref ? (
          <Link
            href={backHref}
            className="mb-3 inline-flex min-h-11 items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Link>
        ) : null}
        <p
          className="font-display text-sm font-bold tracking-[0.08em] md:text-base"
          style={{ color: "var(--color-curie-lightblue)" }}
        >
          {kicker}
        </p>
        <h1 className="font-display mt-2 text-2xl font-bold md:text-4xl">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-white/80">{subtitle}</p> : null}
      </header>
      <main className="mx-auto w-full max-w-[1600px] space-y-5 px-4 py-5 md:px-8 md:py-8">{children}</main>
    </div>
  );
}
