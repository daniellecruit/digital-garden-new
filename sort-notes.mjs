import fs from "fs";
import path from "path";

// Folder paths
const vaultAPath = "/Users/daniellecruit/Documents/Private Obsidian Vault/Public-to-publish";
const vaultBPath = "/Users/daniellecruit/Desktop/digital-garden/content";
const imageOutputPath = "/Users/daniellecruit/Desktop/digital-garden/public/assets/images";

// Ensure folders exist
for (const stage of ["seedling", "budding", "evergreen"]) {
  fs.mkdirSync(path.join(vaultBPath, stage), { recursive: true });
}
fs.mkdirSync(imageOutputPath, { recursive: true });

const noteFiles = fs.readdirSync(vaultAPath).filter(file => file.endsWith(".md"));

function getStageFromTags(content) {
  const match = content.match(/stage:\s*(\w+)/);
  return match ? match[1].toLowerCase() : null;
}

function getTitleFromFilename(filename) {
  return path.basename(filename, ".md").toLowerCase().replace(/\s+/g, "-");
}

function replaceImageEmbeds(content, titleSlug, noteDir) {
  return content.replace(/!\[\[(.*?)\]\]/g, (match, filename) => {
    const sourceImagePath = path.join(noteDir, filename);
    if (fs.existsSync(sourceImagePath)) {
      const newName = `${titleSlug}--${filename}`;
      const targetImagePath = path.join(imageOutputPath, newName);
      fs.copyFileSync(sourceImagePath, targetImagePath);
      return `![${filename}](../assets/images/${newName})`;
    } else {
      console.warn(`⚠️ Image not found: ${filename}`);
      return match;
    }
  });
}

for (const file of noteFiles) {
  const notePath = path.join(vaultAPath, file);
  const content = fs.readFileSync(notePath, "utf8");
  const stage = getStageFromTags(content);
  const titleSlug = getTitleFromFilename(file);

  if (!stage || !["seedling", "budding", "evergreen"].includes(stage)) {
    console.log(`⏭ Skipping ${file} — no valid stage tag`);
    continue;
  }

  const updatedContent = replaceImageEmbeds(content, titleSlug, vaultAPath);
  const timestamp = Date.now();
  const outputFilename = `${titleSlug}-${timestamp}.md`;
  const outputPath = path.join(vaultBPath, stage, outputFilename);

  fs.writeFileSync(outputPath, updatedContent);
  console.log(`✅ Copied ${file} to ${stage}/${outputFilename}`);
}
