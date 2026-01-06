
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
/* eslint-enable semi, eol-last, quotes, switch-colon-spacing, no-dupe-keys, indent, comma-dangle */


const {
  rmdir,
  stat,
  unlink,
  readdir,
  copyFile,
  readFile,
  writeFile,
} = require("node:fs/promises");

const path = require("node:path");
const { existsSync } = require("node:fs");


const SRC_PATH = path.join(process.cwd(), process.env.SOURCE_PATH || "src");
const DEST_PATH = path.join(process.cwd(), process.env.OUTPUT_PATH || "dist");
const MD_PATH = path.join(process.cwd(), "..", "README.md");


(async function() {
  if(!existsSync(DEST_PATH)) {
    throw new Error("Missing output directory for node.js' files");
  }

  if(!existsSync(SRC_PATH)) {
    throw new Error("Missing source directory for node.js' files");
  }

  if(process.env.NODE_ENV === "production") {
    try {
      await rimraf(path.join(DEST_PATH, "test"));

      await rmfl(DEST_PATH, [
        {
          rule: "pattern",
          value: /(.*).spec(\.d)?.(ts|js)$/,
        },
        {
          rule: "equals",
          value: "test.ts",
        },
        {
          rule: "equals",
          value: "test.js",
        },
        {
          rule: "equals",
          value: "test.d.ts",
        },
        {
          rule: "equals",
          value: "types.js",
        },
      ]);
    } catch (err) {
      if(err?.code !== "ENOENT") {
        throw err;
      }
    }

    if( existsSync(MD_PATH) ) {
      await copyFile(MD_PATH, path.join(DEST_PATH, "README.md"));
    }

    if( existsSync(path.join(process.cwd(), "package.json")) ) {
      const rawBuf = await readFile(path.join(process.cwd(), "package.json"));
      const pkgObject = JSON.parse(rawBuf.toString("utf8"));

      delete pkgObject["devDependencies"];
      delete pkgObject["scripts"];

      await writeFile(
        path.join(DEST_PATH, "package.json"),
        JSON.stringify(pkgObject, null, 2),
        "utf8",
      );
    }
  }
})();



async function rimraf(p) {
  if(!existsSync(p)) return;
  const s = await stat(p);

  if(s.isDirectory()) {
    const bc = await readdir(p);

    for(const fbase of bc) {
      const curr = path.join(p, fbase);
      await rimraf(curr);
    }

    await rmdir(p);
  } else {
    await unlink(p);
  }
}

/**
 * 
 * @param {string} p 
 * @param {Array<{ rule: 'startsWith' | 'endsWith' | 'equals'; value: string } | { rule: 'pattern'; value: RegExp }> | null} dif 
 */
async function rmfl(p, dif = null) {
  if(!existsSync(p) || dif == null || !Array.isArray(dif)) return;
  const s = await stat(p);

  if(s.isDirectory()) {
    const bc = await readdir(p);

    for(const fbase of bc) {
      const curr = path.join(p, fbase);
      await rmfl(curr, dif);
    }
  } else {
    const base = path.basename(p);

    for(const { rule, value } of dif) {
      if(rule === "pattern") {
        if(value.test(base)) {
          await unlink(p);
        }

        continue;
      }

      if(rule === "equals") {
        if(value === base) {
          await unlink(p);
        }

        continue;
      }

      if(value[rule](value)) {
        await unlink(p);
      }
    }
  }
}
