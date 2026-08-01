import fs from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = path.resolve(".");
const failures = [];

async function walk(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if ([".git", "node_modules"].includes(entry.name)) continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(fullPath));
    else if (entry.isFile()) files.push(fullPath);
  }
  return files;
}

const files = await walk(root);
const htmlFiles = files.filter((file) => file.endsWith(".html"));
const forbidden = [/support\.js/i, /image-slot\.js/i, /{{|}}/, /<\/?sc-/i, /style-hover=/i, /\sstyle=/i];

for (const file of htmlFiles) {
  const relative = path.relative(root, file);
  const html = await fs.readFile(file, "utf8");
  for (const pattern of forbidden) {
    if (pattern.test(html)) failures.push(`${relative}: contains forbidden prototype syntax (${pattern})`);
  }
  for (const required of [/<title>[^<]+<\/title>/i, /<meta name="description"/i, /<link rel="canonical"/i, /<main id="main">/i]) {
    if (!required.test(html)) failures.push(`${relative}: missing required markup (${required})`);
  }
  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = match[0];
    if (!/\balt="[^"]*"/i.test(tag)) failures.push(`${relative}: image is missing alt text`);
    if (!/\bwidth="\d+"/i.test(tag) || !/\bheight="\d+"/i.test(tag)) failures.push(`${relative}: image is missing explicit dimensions`);
  }
  for (const match of html.matchAll(/<a\b[^>]*href="(https?:\/\/[^\"]+)"[^>]*>/gi)) {
    const tag = match[0];
    if (!/target="_blank"/i.test(tag) || !/rel="noopener"/i.test(tag)) failures.push(`${relative}: external link is missing target/rel (${match[1]})`);
  }
  const hasBase = /<base href="\/portfolio\/">/i.test(html);
  for (const match of html.matchAll(/\b(?:src|href)="([^\"]+)"/gi)) {
    const url = match[1];
    if (/^(?:https?:|mailto:|tel:|#|data:)/i.test(url)) continue;
    const clean = url.split(/[?#]/)[0];
    if (!clean) continue;
    let destination;
    if (hasBase) destination = path.join(root, clean.replace(/^\/?portfolio\//, ""));
    else destination = path.resolve(path.dirname(file), clean);
    if (clean.endsWith("/")) destination = path.join(destination, "index.html");
    try {
      const stat = await fs.stat(destination);
      if (stat.isDirectory()) await fs.stat(path.join(destination, "index.html"));
    } catch {
      failures.push(`${relative}: broken local reference ${url}`);
    }
  }
}

const scriptCheck = spawnSync(process.execPath, ["--check", "site.js"], { cwd: root, encoding: "utf8" });
if (scriptCheck.status !== 0) failures.push(`site.js: ${scriptCheck.stderr.trim()}`);

const expectedPages = [
  "index.html",
  "work/index.html",
  "work/pringles/index.html",
  "work/dr-pepper/index.html",
  "work/woop/index.html",
  "work/interior-goods-direct/index.html",
  "work/marshall/index.html",
  "work/ernest-jones/index.html",
  "work/sapphire/index.html",
  "404.html"
];

for (const expected of expectedPages) {
  if (!files.some((file) => path.relative(root, file) === expected)) failures.push(`Missing page: ${expected}`);
}

if (failures.length) {
  console.error(`Validation failed with ${failures.length} issue(s):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Validated ${htmlFiles.length} HTML pages, local links, image metadata and JavaScript syntax.`);
