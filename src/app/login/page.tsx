import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { BrandLogo } from "@/components/layout/brand-logo";

function safeNextPath(value?: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/login")) {
    return "/cohorts";
  }
  return value;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const next = safeNextPath(params.next);

  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <section
        className="relative overflow-hidden px-6 py-10 text-white md:flex md:w-[46%] md:flex-col md:justify-between md:px-12 md:py-14"
        style={{ background: "var(--gradient-navy)" }}
      >
        <div className="flex items-center gap-4">
          <BrandLogo className="h-16 md:h-[4.5rem]" />
          <div>
            <p
              className="font-display text-[22px] font-bold tracking-[0.06em] md:text-[28px]"
              style={{ color: "var(--color-curie-lightblue)" }}
            >
              She for STEM
            </p>
            <p className="mt-1 text-sm text-white/75">VigyanShaala · Kalpana Incubators</p>
          </div>
        </div>
        <div className="relative mt-10 max-w-md md:mt-0">
          <h1 className="font-display text-3xl font-bold leading-tight md:text-5xl">
            Telangana Colleges
            <span className="mt-1 block" style={{ color: "var(--color-curie-yellow)" }}>
              Dashboard
            </span>
          </h1>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/80 md:text-base">
            Track Telangana college selection and student performance for 3rd Year : Old batch
            (Feb-Aug 2026) and 2nd Year : Current Batch (Aug-Feb 2027).
          </p>
        </div>
      </section>
      <section className="flex flex-1 items-center justify-center bg-[var(--color-page)] px-5 py-10 md:px-12">
        <div
          className="curie-rise w-full max-w-md rounded-[24px] bg-white p-6 md:p-8"
          style={{
            border: "1px solid var(--color-curie-border)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <h2 className="font-display text-2xl font-bold text-[var(--color-navy)]">
            Admin sign in
          </h2>
          <p className="mt-1 mb-6 text-sm text-[var(--color-curie-muted)]">
            Program team only. Students and colleges do not sign in here — they open Student view.
          </p>
          <LoginForm next={next} />
          <p className="mt-6 text-center text-sm text-[var(--color-curie-muted)]">
            Student / college access:{" "}
            <Link
              href="/student-view"
              className="font-semibold text-[var(--color-navy)] underline-offset-4 hover:underline"
            >
              telangana-colleges-dashboard.vercel.app/student-view
            </Link>
            . No login.
          </p>
        </div>
      </section>
    </div>
  );
}
