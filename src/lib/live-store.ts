import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { EMPTY_STORE, type LiveStore } from "@/lib/store-types";

type GlobalStore = typeof globalThis & {
  __curriculumCohortStore?: LiveStore;
  __curriculumCohortStoreMtime?: number;
};

const g = globalThis as GlobalStore;

function storePath() {
  if (process.env.VERCEL) {
    return path.join("/tmp", "telangana-colleges-live.json");
  }
  return path.join(process.cwd(), "data", "live-store.json");
}

export async function readLiveStore(): Promise<LiveStore> {
  try {
    const file = storePath();
    const info = await stat(file);
    if (g.__curriculumCohortStore && g.__curriculumCohortStoreMtime === info.mtimeMs) {
      return g.__curriculumCohortStore;
    }
    const raw = await readFile(file, "utf8");
    const parsed = JSON.parse(raw) as LiveStore;
    parsed.requests = parsed.requests ?? [];
    parsed.uploads = parsed.uploads ?? [];
    parsed.batches = parsed.batches ?? {};
    g.__curriculumCohortStore = parsed;
    g.__curriculumCohortStoreMtime = info.mtimeMs;
    return parsed;
  } catch {
    g.__curriculumCohortStore = EMPTY_STORE;
    g.__curriculumCohortStoreMtime = 0;
    return EMPTY_STORE;
  }
}

export async function writeLiveStore(store: LiveStore) {
  g.__curriculumCohortStore = store;
  const file = storePath();
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(store, null, 2), "utf8");
  try {
    g.__curriculumCohortStoreMtime = (await stat(file)).mtimeMs;
  } catch {
    g.__curriculumCohortStoreMtime = Date.now();
  }
}
