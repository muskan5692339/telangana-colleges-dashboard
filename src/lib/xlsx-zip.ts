import { deflateRawSync, inflateRawSync } from "node:zlib";

function crc32(data: Buffer) {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i += 1) {
    crc ^= data[i];
    for (let bit = 0; bit < 8; bit += 1) {
      const take = crc & 1;
      crc >>>= 1;
      if (take) crc ^= 0xedb88320;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export function readZip(buffer: Buffer): Map<string, Buffer> {
  const files = new Map<string, Buffer>();
  let eocd = -1;
  const min = Math.max(0, buffer.length - 22 - 65535);
  for (let i = buffer.length - 22; i >= min; i -= 1) {
    if (buffer.readUInt32LE(i) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) return files;
  const count = buffer.readUInt16LE(eocd + 10);
  let offset = buffer.readUInt32LE(eocd + 16);
  for (let i = 0; i < count; i += 1) {
    if (offset + 46 > buffer.length || buffer.readUInt32LE(offset) !== 0x02014b50) break;
    const method = buffer.readUInt16LE(offset + 10);
    const compSize = buffer.readUInt32LE(offset + 20);
    const nameLen = buffer.readUInt16LE(offset + 28);
    const extraLen = buffer.readUInt16LE(offset + 30);
    const commentLen = buffer.readUInt16LE(offset + 32);
    const localHeader = buffer.readUInt32LE(offset + 42);
    const name = buffer.subarray(offset + 46, offset + 46 + nameLen).toString("utf8");
    if (localHeader + 30 <= buffer.length && buffer.readUInt32LE(localHeader) === 0x04034b50) {
      const localNameLen = buffer.readUInt16LE(localHeader + 26);
      const localExtraLen = buffer.readUInt16LE(localHeader + 28);
      const dataStart = localHeader + 30 + localNameLen + localExtraLen;
      const data = buffer.subarray(dataStart, dataStart + compSize);
      try {
        const content = method === 0 ? Buffer.from(data) : inflateRawSync(data);
        files.set(name.replace(/\\/g, "/"), content);
      } catch {
        // skip unreadable entries
      }
    }
    offset += 46 + nameLen + extraLen + commentLen;
  }
  return files;
}

export function writeZip(files: Map<string, Buffer>): Buffer {
  const locals: Buffer[] = [];
  const centrals: Buffer[] = [];
  let offset = 0;
  for (const [name, content] of files) {
    const nameBuf = Buffer.from(name, "utf8");
    const compressed = deflateRawSync(content);
    const crc = crc32(content);
    const local = Buffer.alloc(30 + nameBuf.length);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0, 6);
    local.writeUInt16LE(8, 8);
    local.writeUInt16LE(0, 10);
    local.writeUInt16LE(0, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(compressed.length, 18);
    local.writeUInt32LE(content.length, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    local.writeUInt16LE(0, 28);
    nameBuf.copy(local, 30);
    locals.push(local, compressed);

    const central = Buffer.alloc(46 + nameBuf.length);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0, 8);
    central.writeUInt16LE(8, 10);
    central.writeUInt16LE(0, 12);
    central.writeUInt16LE(0, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(compressed.length, 20);
    central.writeUInt32LE(content.length, 24);
    central.writeUInt16LE(nameBuf.length, 28);
    central.writeUInt16LE(0, 30);
    central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36);
    central.writeUInt32LE(0, 38);
    central.writeUInt32LE(offset, 42);
    nameBuf.copy(central, 46);
    centrals.push(central);
    offset += local.length + compressed.length;
  }

  const centralDir = Buffer.concat(centrals);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(files.size, 8);
  eocd.writeUInt16LE(files.size, 10);
  eocd.writeUInt32LE(centralDir.length, 12);
  eocd.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, centralDir, eocd]);
}

function decodeXml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function attr(tag: string, key: string) {
  const match = tag.match(new RegExp(`${key}="([^"]*)"`, "i")) ?? tag.match(new RegExp(`${key}='([^']*)'`, "i"));
  return match ? decodeXml(match[1]) : "";
}

function injectTabColor(xml: string, rgb: string) {
  if (/<tabColor[\s/>]/i.test(xml)) return xml;
  if (/<sheetPr\b[^>]*\/>/i.test(xml)) {
    return xml.replace(/<sheetPr\b([^>]*)\/>/i, `<sheetPr$1><tabColor rgb="${rgb}"/></sheetPr>`);
  }
  if (/<sheetPr\b/i.test(xml)) {
    return xml.replace(/<sheetPr\b([^>]*)>/i, `<sheetPr$1><tabColor rgb="${rgb}"/>`);
  }
  return xml.replace(/<worksheet\b([^>]*)>/i, `<worksheet$1><sheetPr><tabColor rgb="${rgb}"/></sheetPr>`);
}

function sheetPathFromTarget(target: string) {
  const cleaned = target.replace(/^\/+/, "");
  if (cleaned.startsWith("xl/")) return cleaned;
  return `xl/${cleaned.replace(/^\.\//, "")}`;
}

export function coloredSheetNames(buffer: Buffer): string[] {
  try {
    const files = readZip(buffer);
    const workbookXml = files.get("xl/workbook.xml")?.toString("utf8");
    const relsXml = files.get("xl/_rels/workbook.xml.rels")?.toString("utf8");
    if (!workbookXml || !relsXml) return [];

    const rels = new Map<string, string>();
    for (const tag of relsXml.matchAll(/<Relationship\b[^>]*>/gi)) {
      const id = attr(tag[0], "Id");
      const target = attr(tag[0], "Target");
      if (id && target) rels.set(id, sheetPathFromTarget(target));
    }

    const colored: string[] = [];
    for (const tag of workbookXml.matchAll(/<sheet\b[^>]*>/gi)) {
      const name = attr(tag[0], "name");
      const rid = attr(tag[0], "r:id") || attr(tag[0], "id");
      const path = rels.get(rid);
      if (!name || !path) continue;
      const sheetXml = files.get(path)?.toString("utf8") ?? "";
      if (/<tabColor[\s/>]/i.test(sheetXml)) colored.push(name);
    }
    return colored;
  } catch {
    return [];
  }
}

export function applyTabColors(buffer: Buffer, sheetNames: string[], rgb = "FF69AB4A"): Buffer {
  const files = readZip(buffer);
  const workbookXml = files.get("xl/workbook.xml")?.toString("utf8");
  const relsXml = files.get("xl/_rels/workbook.xml.rels")?.toString("utf8");
  if (!workbookXml || !relsXml) return buffer;

  const rels = new Map<string, string>();
  for (const tag of relsXml.matchAll(/<Relationship\b[^>]*>/gi)) {
    const id = attr(tag[0], "Id");
    const target = attr(tag[0], "Target");
    if (id && target) rels.set(id, sheetPathFromTarget(target));
  }

  const wanted = new Set(sheetNames);
  for (const tag of workbookXml.matchAll(/<sheet\b[^>]*>/gi)) {
    const name = attr(tag[0], "name");
    const rid = attr(tag[0], "r:id") || attr(tag[0], "id");
    const path = rels.get(rid);
    if (!name || !path || !wanted.has(name)) continue;
    const xml = files.get(path)?.toString("utf8");
    if (!xml) continue;
    files.set(path, Buffer.from(injectTabColor(xml, rgb), "utf8"));
  }
  return writeZip(files);
}
