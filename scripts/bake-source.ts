// Usage: npx tsx scripts/bake-source.ts <inc10|inc13> <workbook.xlsx> [--write]
// Prints what the upload would import; with --write it updates the overlay JSON that ships in code.
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { overlayPath, serializeOverlay } from "../src/lib/github-publish";
import { parseWorkbook } from "../src/lib/parse-excel";
import { isBatchId } from "../src/lib/cohort-data";

const [batchId, file] = process.argv.slice(2);
if (!isBatchId(batchId) || !file) {
  throw new Error("Usage: npx tsx scripts/bake-source.ts <inc10|inc13> <workbook.xlsx> [--write]");
}
const parsed = parseWorkbook(readFileSync(file));
const selected = parsed.students.filter((student) => student.acceleratorSelected);
console.log({
  usedSheets: parsed.usedSheets,
  skippedSheets: parsed.skippedSheets,
  colleges: parsed.colleges.length,
  students: parsed.students.length,
  acceleratorSelected: selected.length,
  collegesWithSelection: parsed.colleges.filter((college) => college.acceleratorSelected > 0).length,
});

if (process.argv.includes("--write")) {
  const target = path.join(process.cwd(), overlayPath(batchId));
  writeFileSync(
    target,
    serializeOverlay({
      colleges: parsed.colleges,
      students: parsed.students,
      sourceSheet: path.basename(file),
      importedSheets: parsed.usedSheets,
    }),
    "utf8",
  );
  console.log(`Wrote ${target}`);
}
