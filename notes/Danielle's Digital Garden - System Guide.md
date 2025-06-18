

---

### 🌿 Project Overview

Your goal is to create an explorable, evolving digital garden where visitors can traverse your creative work through thematic, developmental, and conceptual pathways. Rather than a static portfolio, this is a living archive—nurtured like a garden—built to support:

- **Dynamic publishing** from your private Obsidian vault
    
- **Versioned notes**, categorized by stage of development
    
- **Rich metadata** for future data visualizations and navigation
    
- **A public Quartz-based site** hosted on Netlify
    

---

### 🔄 Publishing Workflow

**Two Vaults:**

- **Vault A (Private):** `/Users/daniellecruit/Documents/Private Obsidian Vault/`
    
- **Vault B (Public):** `/Users/daniellecruit/Desktop/digital-garden/`
    

You work in Vault A, then drop publish-ready notes into a special folder:  
`**/Public-to-publish/**`

When a script is run, these notes are:

- Copied (not moved) into Vault B
    
- Enriched with metadata
    
- Renamed to include date and stage
    
- Sorted into subfolders by stage:
    
    - `seedlings/`
        
    - `budding/`
        
    - `evergreen/`
        

After copying, a Git commit and push automatically syncs Vault B to your GitHub repo, which in turn triggers a Netlify deploy.

---

### 📂 YAML Frontmatter Template

Each published note gets enriched with a consistent YAML block:

```
---
title: My Note Title
published: true
stage: seedling
published_date: 2025-06-18
last_updated: 2025-06-18
tags:
  - seedling
  - art
---
```

More fields can be added later, such as:

- `slug:`
    
- `theme:`
    
- `series:`
    
- `visual_coords:`
    

---

### 📝 Script Summary

Script file: `sort-notes.mjs`

What it does:

1. Walks through all `.md` files in `/Public-to-publish/`
    
2. Reads their YAML frontmatter
    
3. Checks tags for one of: `seedling`, `budding`, `evergreen`
    
4. Copies them into the matching subfolder in Vault B
    
5. Adds/updates metadata in the YAML
    
6. Renames files to include stage + date, e.g. `my-note_seedling_2025-06-18.md`
    
7. Auto-commits and pushes to GitHub
    

---

### 🌐 Site Infrastructure

- **Quartz 4.5.1**: Static site generator based on Obsidian
    
- **Netlify**: Deploys the site when Vault B is updated
    
- **GitHub**: Hosts the repo `daniellecruit/digital-garden-new`
    

Quartz reads the content from Vault B’s `notes/` folder, structured like:

```
notes/
├── seedlings/
├── budding/
└── evergreen/
```

---

### 🌈 Future Possibilities

- **Custom metaphors:** Currently using the garden model (seedling → budding → evergreen)
    
- **Tag-based pathways:** Let visitors browse by themes, moods, materials
    
- **Visual navigation:** Graphs, galleries, spatial layouts
    
- **Media syncing:** Smart handling of images/videos/art
    
- **Obsidian plugin:** Wrap the workflow into an Obsidian command
    

---

### ✉️ Next Steps (Suggestions)

- YAML template snippets in Vault A
    
- Smart image/media folder integration
    
- Add `slug` + `summary` to YAML
    
- Plan tag visualizations (e.g. D3.js or Observable)
    
- Enable backlinks and graphing on site
    

---

_This is your garden manual. Let’s grow it._