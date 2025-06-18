import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { fileURLToPath } from "url"
import { format } from "date-fns"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const inputFolder = "/Users/daniellecruit/Documents/Private Obsidian Vault/Public-to-publish"
const outputNotesFolder = "/Users/daniellecruit/Desktop/digital-garden/notes"
const outputImagesFolder = "/Users/daniellecruit/Desktop/digital-garden/public/assets/images"

const STAGES = ["seed", "budding", "evergreen"]

const getStageFolder = (stage) => {
  return STAGES.includes(stage) ? path.join(outputNotesFolder, stage) : null
}

const ensureDirExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

const copyFileWithOverwrite = (src, dest) => {
  fs.copyFileSync(src, dest)
  console.log(`✓ Copied: ${path.basename(src)} → ${dest}`)
}

const processMarkdownFile = (filePath) => {
  const rawContent = fs.readFileSync(filePath, "utf8")
  const { data, content } = matter(rawContent)

  if (!data.stage || !STAGES.includes(data.stage)) {
    console.warn(`⚠️  Skipping ${path.basename(filePath)} — no valid stage found.`)
    return
  }

  const stageFolder = getStageFolder(data.stage)
  ensureDirExists(stageFolder)

  // Update frontmatter
  const newData = { ...data, publish: true }
  if (!newData.published) {
    newData.published = format(new Date(), "yyyy-MM-dd")
  }

  const updatedNote = matter.stringify(content, newData)
  const destPath = path.join(stageFolder, path.basename(filePath))

  fs.writeFileSync(destPath, updatedNote)
  console.log(`✓ Processed: ${path.basename(filePath)} → ${stageFolder}`)
}

const processImageFile = (filePath) => {
  ensureDirExists(outputImagesFolder)
  const destPath = path.join(outputImagesFolder, path.basename(filePath))
  copyFileWithOverwrite(filePath, destPath)
}

const syncNotes = () => {
  console.log("🌱 Syncing notes from:", inputFolder)

  const files = fs.readdirSync(inputFolder)
  files.forEach((file) => {
    const ext = path.extname(file).toLowerCase()
    const fullPath = path.join(inputFolder, file)

    if (ext === ".md") {
      processMarkdownFile(fullPath)
    } else if ([".png", ".jpg", ".jpeg", ".gif", ".webp"].includes(ext)) {
      processImageFile(fullPath)
    } else {
      console.warn(`⚠️  Skipping unsupported file type: ${file}`)
    }
  })

  console.log("✅ Sync complete.")
}

syncNotes()
