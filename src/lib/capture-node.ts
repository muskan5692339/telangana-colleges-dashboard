import { toast } from "sonner";

function slugFile(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function captureNodePng(node: HTMLElement, filename: string) {
  const { toPng } = await import("html-to-image");
  const width = Math.max(node.scrollWidth, node.offsetWidth);
  const height = Math.max(node.scrollHeight, node.offsetHeight);
  const dataUrl = await toPng(node, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: "#ffffff",
    width,
    height,
    style: {
      width: `${width}px`,
      height: `${height}px`,
    },
  });
  const link = document.createElement("a");
  link.download = `${slugFile(filename) || "table"}.png`;
  link.href = dataUrl;
  link.click();
  toast("Screenshot saved");
}
