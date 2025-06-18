import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { execSync } from "child_process";

const VAULT_A_PATH = "/Users/daniellecruit/Documents/Private Obsidian Vault/Public-to-publish";
const VAULT_B_PATH = "/Users/daniellecruit/Desktop/digital-garden/notes";

const STAGES = {
  seedling: "seedlings",
  budding: "budding",
  evergreen: "evergreen"
};

function getStageTag(tags) {
  for (const tag of tags) {
    if (STAGES[tag]) return tag;
  }
  return null;
}

function extractTags(content) {
  const { data } = matter(content);
  const tags = data?.tags || [];
  if (typeof tags === "string") return [tags];
  return Array.isArray(tags) ? tags : [];
}

function safeFileName(baseName, stage, date) {
  const ext = path.extname(baseName);              // .md
  const name = path.basename(baseName, ext);       // my-note
  return `${name}_${stage}_${date}${ext}`;         // my-note_seedling_2025-06-18.md
}

function formatDate(date) {
  return date.toISOString().split("T")[0]; // YYYY-MM-DD
}

function enrichFrontmatter(content, stage, publishedDate, lastUpdated) {
  const parsed = matter(content);
  const newData = {
    ...parsed.data,
    published: true,
    stage,
    published_date: publishedDate,
    last_updated: lastUpdated,
  };

  return matter.stringify(parsed.content, newData);
}

function copyNote(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const tags = extractTags(content);
  const stage = getStageTag(tags);

  if (!stage) {
    console.log(`Skipping ${filePath} — no publish stage tag found.`);
    return;
  }

  const fileStats = fs.statSync(filePath);
  const now = formatDate(new Date());
  const modified = formatDate(fileStats.mtime);

  const enriched = enrichFrontmatter(content, stage, now, modified);

  const relativePath = path.relative(VAULT_A_PATH, filePath);
  const baseName = path.basename(relativePath);
  const renamedFile = safeFileName(baseName, stage, now);

  const destinationDir = path.join(VAULT_B_PATH, STAGES[stage]);
  const destinationPath = path.join(destinationDir, renamedFile);

  fs.mkdirSync(destinationDir, { recursive: true });
  fs.writeFileSync(destinationPath, enriched);

  console.log(`Copied + enriched "${baseName}" → ${STAGES[stage]}/${renamedFile}`);
}

function walkDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      walkDirectory(fullPath);
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      copyNote(fullPath);
    }
  }
}

// 🛠️ Run all
walkDirectory(VAULT_A_PATH);

// ✅ Commit to Git
try {
  execSync("git add .", { cwd: VAULT_B_PATH });
  execSync(`git commit -m "Auto-publish notes on ${formatDate(new Date())}"`, { cwd: VAULT_B_PATH });
  execSync("git push", { cwd: VAULT_B_PATH });
  console.log("✅ Auto-committed + pushed changes to Git.");
} catch (e) {
  console.warn("⚠️ Git commit failed. Make sure you're inside a repo and logged in.");
}
