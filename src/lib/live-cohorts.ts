import { BATCHES } from "@/lib/cohort-data";
import { INC10_SOURCE_OVERLAY } from "@/lib/inc10-source";
import { INC13_SOURCE_OVERLAY } from "@/lib/inc13-source";
import { overlayBatch, type LiveBatchOverlay } from "@/lib/store-types";
import { readLiveStore } from "@/lib/live-store";
import type { Batch, BatchId } from "@/lib/types";

const SOURCE_OVERLAY: Partial<Record<BatchId, LiveBatchOverlay>> = {
  inc10: INC10_SOURCE_OVERLAY,
  inc13: INC13_SOURCE_OVERLAY,
};

function pickOverlay(batchId: BatchId, live?: LiveBatchOverlay) {
  const baked = SOURCE_OVERLAY[batchId];
  if (!live || live.students.length === 0) return baked;
  return live;
}

export async function listLiveCohorts(): Promise<Batch[]> {
  const store = await readLiveStore();
  return Object.values(BATCHES).map((seed) => overlayBatch(seed, pickOverlay(seed.id, store.batches[seed.id])));
}

export async function getLiveCohortBySlug(slug: string | null | undefined): Promise<Batch | null> {
  if (!slug) return null;
  const cohorts = await listLiveCohorts();
  return cohorts.find((cohort) => cohort.slug === slug) ?? null;
}
