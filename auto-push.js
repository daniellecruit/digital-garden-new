import { exec } from "child_process";
import chokidar from "chokidar";

// Path to watch — change this to your Quartz folder if different
const folderToWatch = "./";

// Debounce delay so commits don't fire too often on many changes
const debounceDelay = 5000; // 5 seconds

let timeoutId = null;

const runGitCommands = () => {
  console.log("Changes detected, committing and pushing...");

  exec("git add .", (err, stdout, stderr) => {
    if (err) {
      console.error("git add error:", err);
      return;
    }
    exec(`git commit -m "Auto-sync update at ${new Date().toISOString()}"`, (err, stdout, stderr) => {
      if (err) {
        if (stderr.includes("nothing to commit")) {
          console.log("No changes to commit.");
          return;
        }
        console.error("git commit error:", err);
        return;
      }
      exec("git push", (err, stdout, stderr) => {
        if (err) {
          console.error("git push error:", err);
          return;
        }
        console.log("Pushed changes successfully!");
      });
    });
  });
};

const watcher = chokidar.watch(folderToWatch, {
  ignored: /(^|[\/\\])\.git/, // ignore .git folder
  persistent: true,
});

watcher.on("all", (event, path) => {
  console.log(`File ${path} changed (${event}), scheduling commit...`);
  if (timeoutId) clearTimeout(timeoutId);
  timeoutId = setTimeout(runGitCommands, debounceDelay);
});

console.log(`Watching ${folderToWatch} for changes...`);
