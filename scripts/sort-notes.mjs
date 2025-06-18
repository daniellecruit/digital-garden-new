// sort-notes.mjs
import fs from "fs"
import path from "path"
import matter from "gray-matter"

const sourceDir = "/Users/daniellecruit/Documents/Private Obsidian Vault/Public-to-publish"
const destBaseDir = "/Users/daniellecruit/Desktop/digital-garden/notes"

const stageToFolder = {
  seed: "seeds",
  budding: "budding",
  evergreen: "evergreen",
}

function ensureDirExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

function copyNote(filePath) {
  const raw = fs.readFileSync(filePath, "utf8")
  const { data: frontmatter } = matter(raw)

  const stage = frontmatter.stage
  const fileName = path.basename(filePath)

  if (!stage || !stageToFolder[stage]) {
    console.warn(`Skipping ${fileName}: no recognized 'stage' frontmatter`)
    return
  }

  const destDir = path.join(destBaseDir, stageToFolder[stage])
  ensureDirExists(destDir)

  const destPath = path.join(destDir, fileName)
  fs.copyFileSync(filePath, destPath)

  console.log(`Copied ${fileName} to ${stageToFolder[stage]}/`)
}

function run() {
  const files = fs.readdirSync(sourceDir)

  files.forEach((file) => {
    const fullPath = path.join(sourceDir, file)
    if (fs.statSync(fullPath).isFile() && file.endsWith(".md")) {
      copyNote(fullPath)
    }
  })
}

run()
