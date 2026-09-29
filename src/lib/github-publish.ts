import type { LiveBatchOverlay } from "@/lib/store-types";
import type { BatchId } from "@/lib/types";

export type PublishResult =
  | { status: "published"; commitUrl: string }
  | { status: "unchanged" }
  | { status: "skipped"; reason: string }
  | { status: "failed"; error: string };

const DEFAULT_REPO = "muskan5692339/telangana-colleges-dashboard";

export function overlayPath(batchId: BatchId) {
  return `src/lib/${batchId}-source-overlay.json`;
}

export function serializeOverlay(overlay: LiveBatchOverlay) {
  return JSON.stringify(overlay);
}

/**
 * Commits the parsed upload into the repo so Vercel redeploys with it baked in.
 * Uploads on Vercel otherwise live only in per-instance /tmp.
 */
export async function publishOverlay(
  batchId: BatchId,
  overlay: LiveBatchOverlay,
  fileName: string,
): Promise<PublishResult> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return { status: "skipped", reason: "GITHUB_TOKEN is not set, so the upload was not saved to GitHub." };
  }
  const repo = process.env.GITHUB_REPO || DEFAULT_REPO;
  const branch = process.env.GITHUB_BRANCH || "main";
  const filePath = overlayPath(batchId);
  const url = `https://api.github.com/repos/${repo}/contents/${filePath}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const content = serializeOverlay(overlay);

  try {
    const current = await fetch(`${url}?ref=${encodeURIComponent(branch)}`, {
      headers: { ...headers, Accept: "application/vnd.github.raw+json" },
      cache: "no-store",
    });
    let sha: string | undefined;
    if (current.ok) {
      if ((await current.text()) === content) return { status: "unchanged" };
      const meta = await fetch(`${url}?ref=${encodeURIComponent(branch)}`, {
        headers: { ...headers, Accept: "application/vnd.github.object+json" },
        cache: "no-store",
      });
      if (!meta.ok) throw new Error(`GitHub lookup failed (${meta.status}).`);
      sha = ((await meta.json()) as { sha?: string }).sha;
    } else if (current.status !== 404) {
      throw new Error(`GitHub lookup failed (${current.status}).`);
    }

    const response = await fetch(url, {
      method: "PUT",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `Data: ${batchId} from ${fileName} (${overlay.colleges.length} colleges, ${overlay.students.length} students)`,
        content: Buffer.from(content, "utf8").toString("base64"),
        branch,
        sha,
      }),
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(`GitHub commit failed (${response.status}). ${detail.slice(0, 200)}`);
    }
    const body = (await response.json()) as { commit?: { html_url?: string } };
    return { status: "published", commitUrl: body.commit?.html_url ?? "" };
  } catch (error) {
    return { status: "failed", error: error instanceof Error ? error.message : String(error) };
  }
}
