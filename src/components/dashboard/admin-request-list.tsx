"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { enrollmentAddName, type ChangeRequest } from "@/lib/types";

function summary(request: ChangeRequest) {
  if (request.target === "college") {
    if (request.type === "add") return `Add college ${request.payload.proposedName || request.payload.collegeName}`;
    if (request.type === "delete") return `Delete college ${request.collegeName}`;
    return `Rename ${request.collegeName} → ${request.payload.proposedName}`;
  }
  if (request.type === "add") {
    const name = enrollmentAddName(request.payload.proposedName || "", request.payload.subjectArea || "");
    return `Enroll ${name} at ${request.collegeName}`;
  }
  if (request.type === "delete") {
    return `Delete ${request.payload.currentName || request.payload.studentCode} at ${request.collegeName}`;
  }
  return `Rename ${request.payload.currentName || request.payload.studentCode} → ${request.payload.proposedName}`;
}

export function AdminRequestList({ requests }: { requests: ChangeRequest[] }) {
  const [items, setItems] = useState(requests);
  const [busy, setBusy] = useState<string | null>(null);
  const [enroll, setEnroll] = useState<Record<string, { loginId: string; password: string }>>({});
  const pending = items.filter((item) => item.status === "pending");
  const reviewed = items.filter((item) => item.status !== "pending");

  async function review(request: ChangeRequest, action: "approve" | "reject") {
    setBusy(request.id);
    const credentials = enroll[request.id] ?? { loginId: "", password: "" };
    const response = await fetch(`/api/requests/${request.id}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        action,
        loginId: credentials.loginId,
        password: credentials.password,
      }),
    });
    const payload = (await response.json().catch(() => null)) as { error?: string; status?: string } | null;
    setBusy(null);
    if (!response.ok) {
      toast.error(payload?.error ?? "Could not review this request.");
      return;
    }
    setItems((current) =>
      current.map((item) =>
        item.id === request.id
          ? { ...item, status: action === "approve" ? "approved" : "rejected", reviewedAt: new Date().toISOString() }
          : item,
      ),
    );
    toast.success(
      action === "approve"
        ? request.type === "add"
          ? "Student enrolled with dummy email and password."
          : "Approved and applied."
        : "Request rejected.",
    );
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-[var(--color-curie-muted)]">
        No student rename, add, or delete requests yet.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h3 className="font-display text-lg font-bold text-[var(--color-navy)]">
          Pending ({pending.length})
        </h3>
        {pending.length === 0 ? (
          <p className="text-sm text-[var(--color-curie-muted)]">Nothing waiting for approval.</p>
        ) : (
          pending.map((request) => {
            const credentials = enroll[request.id] ?? { loginId: "", password: "" };
            const addStudent = request.type === "add" && request.target === "student";
            return (
              <article
                key={request.id}
                className="rounded-[20px] bg-white p-4"
                style={{ border: "1px solid var(--color-curie-border)", boxShadow: "var(--shadow-card)" }}
              >
                <p className="font-semibold text-[var(--color-navy)]">{summary(request)}</p>
                <p className="mt-1 text-[12px] text-[var(--color-curie-muted)]">
                  {request.target} · {request.type} · {request.requestedFrom} ·{" "}
                  {new Date(request.requestedAt).toLocaleString()}
                </p>
                {addStudent && (
                  <p className="mt-2 text-sm text-[var(--color-navy)]">
                    Subject Area: <strong>{request.payload.subjectArea || "—"}</strong>
                  </p>
                )}
                {request.payload.reason && (
                  <p className="mt-2 text-sm">{request.payload.reason}</p>
                )}
                {addStudent ? (
                  <form
                    className="mt-3 space-y-3"
                    onSubmit={(event) => {
                      event.preventDefault();
                      void review(request, "approve");
                    }}
                  >
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor={`enroll-email-${request.id}`}>Dummy email</Label>
                        <Input
                          id={`enroll-email-${request.id}`}
                          value={credentials.loginId}
                          onChange={(event) =>
                            setEnroll((current) => ({
                              ...current,
                              [request.id]: { ...credentials, loginId: event.target.value },
                            }))
                          }
                          placeholder="code@sfsvigyanshaala.com"
                          className="h-12 text-base"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor={`enroll-password-${request.id}`}>Password</Label>
                        <Input
                          id={`enroll-password-${request.id}`}
                          value={credentials.password}
                          onChange={(event) =>
                            setEnroll((current) => ({
                              ...current,
                              [request.id]: { ...credentials, password: event.target.value },
                            }))
                          }
                          placeholder="VS@123"
                          className="h-12 text-base"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button type="submit" className="h-11 rounded-full px-4" disabled={busy === request.id}>
                        Enroll
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-11 rounded-full px-4"
                        disabled={busy === request.id}
                        onClick={() => review(request, "reject")}
                      >
                        Reject
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      className="h-11 rounded-full px-4"
                      disabled={busy === request.id}
                      onClick={() => review(request, "approve")}
                    >
                      Approve
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 rounded-full px-4"
                      disabled={busy === request.id}
                      onClick={() => review(request, "reject")}
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </article>
            );
          })
        )}
      </section>
      {reviewed.length > 0 && (
        <section className="space-y-2">
          <h3 className="font-display text-lg font-bold text-[var(--color-navy)]">Reviewed</h3>
          <ul className="space-y-1 text-sm">
            {reviewed.slice(0, 20).map((request) => (
              <li key={request.id} className="text-[var(--color-curie-muted)]">
                <span className="font-semibold text-[var(--color-navy)]">{request.status}</span>
                {" · "}
                {summary(request)}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
