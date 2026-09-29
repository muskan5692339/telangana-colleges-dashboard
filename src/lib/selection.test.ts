import assert from "node:assert/strict";
import test from "node:test";
import { asHeadcount, formatSelectionPct, selectionPct } from "./selection";

test("8/12 stored as 0.666... becomes headcount 8", () => {
  assert.equal(asHeadcount(0.6666666666666666, 12), 8);
  assert.equal(asHeadcount(8, 12), 8);
  assert.equal(asHeadcount(66.66666666666666, 12), 8);
});

test("a fractional value without enrolled is not rounded to 1", () => {
  assert.equal(asHeadcount(0.6666666666666666, 0), 0);
});

test("a count of 1 is not treated as 100%", () => {
  assert.equal(asHeadcount(1, 35), 1);
});

test("selection percent is 67 for 8 of 12", () => {
  const pct = selectionPct(8, 12);
  assert.equal(pct != null, true);
  assert.equal(Math.round(pct ?? 0), 67);
  assert.equal(formatSelectionPct(pct), "67%");
});
