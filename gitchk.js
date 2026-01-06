
/**
 * Copyright © 2025 Alerta Dino. All rights reserved.
 * 
 * This code was released under the BSD 3-Clause License.
 * See the "LICENSE" file under project root.
 * 
 * @author (PUBLIC_ID) 1D-C2-9B-98-D6-C3-D6-AB
 * @signphrase It was created on Earth by humans, although
 *             I can't define what a "human" is.
 */


/* eslint-disable */
/* eslint-enable semi, eol-last, quote, switch-colon-spacing, no-dupe-keys, indent, comma-dangle */

const path = require("node:path");
const { EOL } = require("node:os");
const { execSync } = require("node:child_process");
const { isMainThread } = require("node:worker_threads");
const { existsSync, statSync, promises: fs } = require("node:fs");


const GIT_ROOT = path.join(process.cwd(), ".git");
const GITIGNORE = path.join(process.cwd(), ".gitignore");


async function main() {
  let allowGitShell = true;
  try { execSync("clear"); } catch { console.clear(); }

  if(!existsSync(GIT_ROOT) || !statSync(GIT_ROOT).isDirectory()) {
    allowGitShell = false;
    console.warn("\x1b[93m\x1b[1mATTENTION!\x1b[0m\x1b[93m The project is not versioned by GIT\x1b[0m");
  }

  // Check GIT info for current directory
  if(allowGitShell) {
    try {
      const logRes = execSync("git log", { cwd: process.cwd() });
      console.log("\x1b[94mThe \x1b[35m`git log`\x1b[94m of current project\x1b[0m\n\n", logRes.toString("utf8"), "\n\n\n");
    } catch { }

    try {
      const statusRes = execSync("git status", { cwd: process.cwd() });
      console.log("\x1b[94mThe \x1b[35m`git status`\x1b[94m of current project\x1b[0m\n\n", statusRes.toString("utf8"), "\n\n\n");
    } catch { }
  }
  // End "Check GIT info for current directory"

  // Shrink .gitignore file size
  try {
    const stat = await fs.stat(GITIGNORE);

    if(stat.size > 1536) {
      console.log(`File .gitignore exceded \"sort\" limit (1536 bytes) in ${stat.size - 1536} bytes`);

      if(!process.argv.includes("--no-shrink-gitignore")) {
        console.log("Shrinking .gitignore...");

        const ts = Date.now();
        const seen = new Set();
        const contents = (await fs.readFile(GITIGNORE, "utf8")).split(/\r?\n/);

        for(let i = 0; i < contents.length; ++i) {
          const line = contents[i].trim();

          if(
            !line
            || line.charCodeAt(0) === 0x3B // ASCII ";"
            || line.charCodeAt(0) === 0x23 // ASCII "#"
          ) continue;

          seen.add(line);
        }

        await fs.writeFile(
          GITIGNORE,
          Array.from(seen).join(EOL),
          "utf8",
        );

        console.log(`Done in ${Date.now() - ts}ms`);
      }
    }
  } catch (err) {
    if(err.code !== "ENOENT") {
      throw err;
    }
  }
  // End "Shrink .gitignore file size"
}


if(isMainThread) {
  main();
}
