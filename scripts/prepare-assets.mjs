import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const sourceRoot = path.resolve(process.argv[2] || "");
const targetRoot = path.resolve("assets");

if (!process.argv[2]) {
  throw new Error("Usage: npm run prepare-assets -- /absolute/path/to/handoff/assets");
}

const sourceStat = await fs.stat(sourceRoot);
if (!sourceStat.isDirectory() || path.basename(sourceRoot) !== "assets") {
  throw new Error(`Expected an assets directory, received: ${sourceRoot}`);
}

if (sourceRoot === targetRoot || targetRoot === path.parse(targetRoot).root) {
  throw new Error("Refusing to overwrite the source or a filesystem root.");
}

await fs.rm(targetRoot, { recursive: true, force: true });
await fs.mkdir(targetRoot, { recursive: true });

async function walk(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(fullPath));
    else if (entry.isFile()) files.push(fullPath);
  }
  return files;
}

const manifest = {};
const sourceFiles = await walk(sourceRoot);

for (const sourceFile of sourceFiles) {
  const relative = path.relative(sourceRoot, sourceFile);
  const extension = path.extname(relative).toLowerCase();
  const isLogo = relative === "logo.png";
  const isImage = [".jpg", ".jpeg", ".png", ".webp"].includes(extension);
  const outputRelative = isImage && !isLogo
    ? relative.replace(/\.(?:jpe?g|png|webp)$/i, ".webp")
    : relative;
  const outputFile = path.join(targetRoot, outputRelative);
  await fs.mkdir(path.dirname(outputFile), { recursive: true });

  if (!isImage || isLogo) {
    await fs.copyFile(sourceFile, outputFile);
  } else {
    await sharp(sourceFile)
      .rotate()
      .resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 84, alphaQuality: 92, effort: 5, smartSubsample: true })
      .toFile(outputFile);
  }

  if (isImage) {
    const metadata = await sharp(outputFile).metadata();
    manifest[`assets/${outputRelative.split(path.sep).join("/")}`] = {
      width: metadata.width,
      height: metadata.height
    };
  }
}

const logoPath = path.join(targetRoot, "logo.png");
await sharp(logoPath).resize(32, 32, { fit: "cover" }).png().toFile(path.join(targetRoot, "favicon.png"));
await sharp(logoPath).resize(180, 180, { fit: "cover" }).png().toFile(path.join(targetRoot, "apple-touch-icon.png"));

for (const icon of ["favicon.png", "apple-touch-icon.png"]) {
  const metadata = await sharp(path.join(targetRoot, icon)).metadata();
  manifest[`assets/${icon}`] = { width: metadata.width, height: metadata.height };
}

await fs.writeFile(
  path.join(targetRoot, "manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
  "utf8"
);

const sourceBytes = (await Promise.all(sourceFiles.map(async (file) => (await fs.stat(file)).size)))
  .reduce((total, size) => total + size, 0);
const outputFiles = await walk(targetRoot);
const outputBytes = (await Promise.all(outputFiles.map(async (file) => (await fs.stat(file)).size)))
  .reduce((total, size) => total + size, 0);

console.log(`Prepared ${Object.keys(manifest).length} images.`);
console.log(`Assets: ${(sourceBytes / 1024 / 1024).toFixed(1)} MB → ${(outputBytes / 1024 / 1024).toFixed(1)} MB.`);
