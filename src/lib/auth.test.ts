import assert from "node:assert/strict";
import test from "node:test";
import { credentialsMatch, DEMO_STAFF } from "./auth";

test("printed demo staff password always signs in", () => {
  assert.equal(credentialsMatch(DEMO_STAFF.email, DEMO_STAFF.password), true);
  assert.equal(credentialsMatch("STAFF@vigyanshaala.com", DEMO_STAFF.password), true);
  assert.equal(credentialsMatch(DEMO_STAFF.email, "wrong"), false);
});

test("blank STAFF_PASSWORD env still accepts the printed password", () => {
  const previous = process.env.STAFF_PASSWORD;
  process.env.STAFF_PASSWORD = "";
  try {
    assert.equal(credentialsMatch(DEMO_STAFF.email, DEMO_STAFF.password), true);
  } finally {
    if (previous == null) delete process.env.STAFF_PASSWORD;
    else process.env.STAFF_PASSWORD = previous;
  }
});
