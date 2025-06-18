import fs from 'fs/promises';
import path from 'path';

// Folder paths:
const inputFolder = '/Users/daniellecruit/Documents/Private Obsidian Vault/Public-to-publish';
const outputNotesFolder = '/Users/daniellecruit/Desktop/digital-garden/notes';
const outputImagesFolder = '/Users/daniellecruit/Desktop/digital-garden/public/assets/images';

// Utility to ensure folder exists
async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (e) {
    // ignore if exists
  }
}

// Find all markdown files in input folder (non-recursive for now)
async function getMarkdownFiles(folder) {
  const files = await fs.readdir(folder);
  return files.filter(f => f.endsWith('.md'));
}

// Extract image paths from markdown content
function extractImagePaths(markdownContent) {
  const regex = /!\[.*?\]\((.*?)\)/g;
  const matches = [];
  let match;
  while ((match = regex.exec(markdownContent)) !== null) {
    matches.push(match[1]);
  }
  return matches;
}

// Copy file helper
async function copyFile(src, dest) {
  await ensureDir(path.dirname(dest));
  await fs.copyFile(src, dest);
  console.log(`Copied: ${src} → ${dest}`);
}

// Main function
async function processNotes() {
  await ensureDir(outputNotesFolder);
  await ensureDir(outputImagesFolder);

  const mdFiles = await getMarkdownFiles(inputFolder);

  for (const fileName of mdFiles) {
    const fullInputPath = path.join(inputFolder, fileName);
    let content = await fs.readFile(fullInputPath, 'utf-8');

    // Extract image paths
    const imagePaths = extractImagePaths(content);

    // For each image path:
    for (const imgRelPath of imagePaths) {
      // Resolve absolute path of image relative to input markdown file
      const imgInputAbsPath = path.resolve(inputFolder, imgRelPath);

      // Copy image to outputImagesFolder keeping the filename
      const imgFilename = path.basename(imgRelPath);
      const imgOutputPath = path.join(outputImagesFolder, imgFilename);

      try {
        await copyFile(imgInputAbsPath, imgOutputPath);

        // Replace image path in markdown content with new website path `/assets/images/filename`
        const newImgPath = `/assets/images/${imgFilename}`;
        // Escape parentheses for regex
        const escapedOldPath = imgRelPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const imgPathRegex = new RegExp(`(!\\[.*?\\])\\(${escapedOldPath}\\)`, 'g');

        content = content.replace(imgPathRegex, `$1(${newImgPath})`);
      } catch (e) {
        console.warn(`Warning: Could not copy image ${imgRelPath} referenced in ${fileName}: ${e.message}`);
      }
    }

    // Write updated markdown content to outputNotesFolder
    const outputNotePath = path.join(outputNotesFolder, fileName);
    await fs.writeFile(outputNotePath, content, 'utf-8');
    console.log(`Processed note: ${fileName}`);
  }

  console.log('Done processing notes!');
}

processNotes().catch(console.error);
