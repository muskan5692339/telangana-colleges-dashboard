"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEMO_STAFF } from "@/lib/auth";
import { loginAction, type LoginState } from "@/app/login/actions";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, null);

  return (
    <form action={action} className="space-y-4" noValidate>
      <input type="hidden" name="next" value={next} />
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          defaultValue={DEMO_STAFF.email}
          className="h-12 bg-white text-base"
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          defaultValue={DEMO_STAFF.password}
          className="h-12 bg-white text-base"
          required
        />
      </div>
      {state?.error && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-[#B91C1C]" role="alert">
          {state.error}
        </p>
      )}
      <Button
        type="submit"
        disabled={pending}
        className="h-12 w-full rounded-full text-base font-semibold"
      >
        {pending ? "Signing in…" : "Sign in"}
      </Button>
      <p className="text-[12px] leading-relaxed text-[var(--color-curie-muted)]">
        Local staff account:{" "}
        <span className="font-semibold text-[var(--color-navy)]">{DEMO_STAFF.email}</span>
        {" · "}
        password <span className="font-semibold text-[var(--color-navy)]">{DEMO_STAFF.password}</span>
      </p>
    </form>
  );
}
