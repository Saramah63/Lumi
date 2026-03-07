import fs from "node:fs/promises";
import path from "node:path";

const SRC_ROOT = path.join(process.cwd(), "public", "lumi");
const OUT_ROOT = path.join(process.cwd(), "public", "lumi_norm");
const TARGET_SIZE = 1024;

function parseNumber(value) {
  if (!value) return null;
  const num = Number.parseFloat(String(value).replace(",", "."));
  return Number.isFinite(num) ? num : null;
}

function parseLengthAttr(svgText, name) {
  const re = new RegExp(`${name}\\s*=\\s*["']([^"']+)["']`, "i");
  const match = svgText.match(re);
  if (!match) return null;
  return parseNumber(match[1]);
}

function parseViewBox(svgText) {
  const viewBoxMatch = svgText.match(/viewBox\s*=\s*["']([^"']+)["']/i);
  if (viewBoxMatch) {
    const parts = viewBoxMatch[1]
      .trim()
      .split(/[\s,]+/)
      .map((p) => Number.parseFloat(p));
    if (parts.length === 4 && parts.every((n) => Number.isFinite(n))) {
      const [x, y, w, h] = parts;
      if (w > 0 && h > 0) return { x, y, w, h };
    }
  }

  const width = parseLengthAttr(svgText, "width");
  const height = parseLengthAttr(svgText, "height");
  if (width && height && width > 0 && height > 0) {
    return { x: 0, y: 0, w: width, h: height };
  }

  return { x: 0, y: 0, w: TARGET_SIZE, h: TARGET_SIZE };
}

function extractInnerSvg(svgText) {
  const match = svgText.match(/<svg\b[^>]*>([\s\S]*?)<\/svg>/i);
  if (!match) {
    throw new Error("Invalid SVG: missing <svg> root.");
  }
  return match[1];
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function walkSvgFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkSvgFiles(fullPath)));
      continue;
    }
    if (entry.isFile() && entry.name.toLowerCase().endsWith(".svg")) {
      files.push(fullPath);
    }
  }

  return files;
}

function buildNormalizedSvg(inner, vb) {
  const sx = TARGET_SIZE / vb.w;
  const sy = TARGET_SIZE / vb.h;
  const tx = -vb.x * sx;
  const ty = -vb.y * sy;

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${TARGET_SIZE} ${TARGET_SIZE}" width="${TARGET_SIZE}" height="${TARGET_SIZE}" preserveAspectRatio="xMidYMid meet">`,
    `<g transform="translate(${tx} ${ty}) scale(${sx} ${sy})">`,
    inner,
    "</g>",
    "</svg>",
    "",
  ].join("\n");
}

async function normalizeFile(srcPath) {
  const rel = path.relative(SRC_ROOT, srcPath);
  const outPath = path.join(OUT_ROOT, rel);
  const raw = await fs.readFile(srcPath, "utf8");
  const viewBox = parseViewBox(raw);
  const inner = extractInnerSvg(raw);
  const normalized = buildNormalizedSvg(inner, viewBox);

  await ensureDir(path.dirname(outPath));
  await fs.writeFile(outPath, normalized, "utf8");
  return { rel, viewBox };
}

async function main() {
  await ensureDir(OUT_ROOT);
  const svgFiles = await walkSvgFiles(SRC_ROOT);
  if (svgFiles.length === 0) {
    console.log("No SVG files found under public/lumi");
    return;
  }

  console.log(`Normalizing ${svgFiles.length} SVG files...`);
  for (const file of svgFiles) {
    const result = await normalizeFile(file);
    console.log(`- ${result.rel} [${result.viewBox.x} ${result.viewBox.y} ${result.viewBox.w} ${result.viewBox.h}]`);
  }
  console.log("Done. Output written to public/lumi_norm");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
