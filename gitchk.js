
/**
 * Copyright © 2025 Alerta Dino. All rights reserved.
 * 
 * THIS CODE IS NOT INTENDED FOR PUBLIC DISTRIBUTION,
 * DON'T USE THIS WITHOUT PERMISSION.
 * 
 * @author (PUBLIC_ID) 1D-C2-9B-98-D6-C3-D6-AB
 * @signphrase It was created on Earth by humans, although
 *             I can't define what a "human" is.
 */


const path = require("node:path");
const { EOL } = require("node:os");
const { isMainThread } = require("node:worker_threads");
const { existsSync, promises: fs } = require("node:fs");


const GITIGNORE = path.join(process.cwd(), ".gitignore");


async function main() {

  // Shrink .gitignore file size
  try {
    const stat = await fs.stat(GITIGNORE);

    if(stat.size > 1536) {
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
        "utf8"
      );
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
