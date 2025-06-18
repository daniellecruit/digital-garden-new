import { spawn } from "child_process";
import chokidar from "chokidar";

// Absolute path to git executable
const gitPath = "/usr/bin/git";

// Path to watch — update this if needed
const folderToWatch = "./";

// Debounce delay in ms
const debounceDelay = 5000;

let timeoutId = null;

const runCommand = (command, args, onExit) => {
  const child = spawn(command, args, { stdio: "inherit" });

  child.on("error", (err) => console.error(`${command} error:`, err));

  child.on("close", (code) => {
    if (code !== 0) {
      console.error(`${command} exited with code ${code}`);
    }
    if (onExit) onExit(code);
  });
};

const runGitCommands = () => {
  console.log("Changes detected, committing and pushing...");

  runCommand(gitPath, ["add", "."], (code) => {
    if (code !== 0) return;

    runCommand(
      gitPath,
      ["commit", "-m", `Auto-sync update at ${new Date().toISOString()}`],
      (code) => {
        if (code !== 0) {
          if (code === 1) {
            // git commit returns 1 if nothing to commit, so treat that as no error
            console.log("No changes to commit.");
            return;
          }
          return;
        }

        runCommand(gitPath, ["push"]);
      }
    );
  });
};

const watcher = chokidar.watch(folderToWatch, {
  ignored: /(^|[\/\\])\.git/,
  persistent: true,
});

watcher.on("all", (event, path) => {
  console.log(`File ${path} changed (${event}), scheduling commit...`);
  if (timeoutId) clearTimeout(timeoutId);
  timeoutId = setTimeout(runGitCommands, debounceDelay);
});

console.log(`Watching ${folderToWatch} for changes...`);
