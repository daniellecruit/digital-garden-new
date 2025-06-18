#!/usr/bin/env node

import fs from "fs/promises"
import path from "path"
import { fileURLToPath } from "url"
import matter from "gray-matter"

// Support __dirname in ESModules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load config from config.json
const configPath = path.join(__dirname, "config.json")
const config = JSON.parse(await fs.readFile(configPath, "utf-8"))

const inputFolder = config.inputFolder
const outputNotesFolder = config.outputNotesFolder
const outputImagesFolder = config.outputImagesFolder

const stagingMap = {
  seed: "seed",
  budding: "budding",
  evergreen: "evergreen",
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true })
}

function generateTimestampedFilename(baseName) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
  const nameWithoutExt = baseName.replace(/\.md$/, "")
  return `${nameWithoutExt}-${timestamp}.md`
}

async function getMarkdownFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  return entries
    .filter((f) => f.isFile() && f.name.endsWith(".md"))
    .map((f) => path.join(dir, f.name))
}

async function copyImage(imagePath, destinationDir) {
  await ensureDir(destinationDir)
  const imageName = path.basename(imagePath)
  const destPath = path.join(destinationDir, imageName)
  await fs.copyFile(imagePath, destPath)
  return imageName
}

async function processNote(notePath) {
  const noteDir = path.dirname(notePath)
  const fileName = path.basename(notePath)
  const rawContent = await fs.readFile(notePath, "utf-8")
  const { data: frontmatter, content: body } = matter(rawContent)

  if (frontmatter.publish !== true) {
    console.log(`Skipping unpublished note: ${fileName}`)
    return
  }

  const stage = frontmatter.stage?.toLowerCase()
  const subfolder = stagingMap[stage]

  if (!subfolder) {
    console.warn(`Note has unknown or missing stage: ${fileName}`)
    return
  }

  const destinationDir = path.join(outputNotesFolder, subfolder)
  await ensureDir(destinationDir)

  const newFileName = generateTimestampedFilename(fileName)
  const destinationPath = path.join(destinationDir, newFileName)

  // Handle images
  let updatedBody = body
  const imageMatches = [...body.matchAll(/!\[[^\]]*\]\((.*?)\)/g)]

  for (const match of imageMatches) {
    const relativeImgPath = match[1]
    const imageFullPath = path.resolve(noteDir, relativeImgPath)

    try {
      const copiedImageName = await copyImage(imageFullPath, outputImagesFolder)
      const newRelPath = path.relative(destinationDir, path.join(outputImagesFolder, copiedImageName))
      updatedBody = updatedBody.replace(relativeImgPath, newRelPath.replace(/\\/g, "/"))
    } catch (err) {
      console.warn(`⚠️ Could not find image "${relativeImgPath}" referenced in ${fileName}`)
    }
  }

  // Final output with updated paths
  const finalNote = matter.stringify(updatedBody, {
    ...frontmatter,
    publish: true, // Ensure this stays true
  })

  await fs.writeFile(destinationPath, finalNote, "utf-8")
  console.log(`✅ Copied and processed: ${newFileName}`)
}

async function main() {
  console.log("📂 Starting sync process...")
  try {
    const files = await getMarkdownFiles(inputFolder)
    if (files.length === 0) {
      console.log("🕊️ No notes found to process.")
    } else {
      for (const file of files) {
        await processNote(file)
      }
    }
    console.log("🌱 Sync complete.")
  } catch (err) {
    console.error("❌ Sync failed:", err)
  }
}

main()
