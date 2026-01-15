
/**
 * Copyright © 2026 Alerta Dino. All rights reserved.
 * 
 * This code was released under the BSD 3-Clause License.
 * See the "LICENSE" file under project root.
 * 
 * @author (PUBLIC_ID) 1D-C2-9B-98-D6-C3-D6-AB
 * @signphrase It was created on Earth by humans, although
 *             I can't define what a "human" is.
 */


import path from "node:path";
import * as fs from "node:fs";
import { uuidv7 } from "uidlib";

import { Database } from "./database";
import { BGDException } from "../errors";
import { type ILogger } from "../lifecycle/debugger";
import { SQL_MIGRATION_FILE_PATTERN } from "./core";
import { left, right, type Either } from "../lifecycle/either";


export interface IMigrateOptions {
  recursive?: boolean;
  ensure?: boolean;
  logger?: ILogger;
}

interface IMigrationFile {
  fullPath: string;
  filename: string;
}


export async function migrate(
  driver: Database,
  directory: fs.PathLike,
  options?: IMigrateOptions // eslint-disable-line comma-dangle
): Promise<Either<BGDException, void>> {
  try {
    const dirPath = directory.toString();

    if(!fs.existsSync(dirPath)) {
      if(options?.ensure) {
        throw new BGDException(
          "[@@migrate] Migrations directory not found",
          "ER_IO_FAIL" // eslint-disable-line comma-dangle
        );
      }

      options?.logger?.log("Migrations directory not found at '%s'", dirPath);
      return right(void 0);
    }

    const filesToProcess = (await collectMigrationFiles_(dirPath, options?.recursive ?? false))
      .toSorted((a, b) => a.filename.localeCompare(b.filename));

    if(filesToProcess.length === 0)
      return right(void 0);

    const executedLogs = await listExecuted_(driver);
    const executedFilenames = new Set(executedLogs.map(item => item.filename));

    const tx = await driver.createTransaction({ allowQueryBatch: true });

    try {
      for(const file of filesToProcess) {
        if(executedFilenames.has(file.filename)) {
          options?.logger?.log("[@@migrate] Migration \"%s\" has already executed. Skipping...", file.filename);
          continue;
        }

        options?.logger?.log("[@@migrate] Running \"%s\"...", file.filename);

        const sqlContent = (await fs.promises.readFile(file.fullPath, "utf8")).trim();
        const orderPrefix = file.filename.split("_")[0] || "000";

        const r1 = await tx.exec(sqlContent);

        if(r1.isLeft()) {
          throw r1.value;
        }

        const r2 = await tx.exec(
          `INSERT INTO bgd_migrations (migration_id, filename, sort_index)
          VALUES ($1::TEXT, $2::TEXT, $3::TEXT)`,
          [uuidv7(), file.filename, orderPrefix] // eslint-disable-line comma-dangle
        );

        if(r2.isLeft()) {
          throw r2.value;
        }
      }

      await tx.commit();
      return right(void 0);
    } catch (err) {
      await tx.rollback();
      throw err;
    }
  } catch (err: unknown) {
    let e: BGDException = err as BGDException;

    if(!(err instanceof BGDException)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      e = new BGDException(`[@@migrate] ${(err as any)?.message || String(err) || "Unknown error"}`);
    }

    return left(e);
  }
}


async function collectMigrationFiles_(dirPath: string, recursive: boolean): Promise<readonly IMigrationFile[]> {
  const res: IMigrationFile[] = [];
  const contents = await fs.promises.readdir(dirPath, { withFileTypes: true });

  for(const entry of contents) {
    const fullPath = path.join(dirPath, entry.name);

    if(entry.isDirectory()) {
      if(recursive) {
        const children = await collectMigrationFiles_(fullPath, recursive);
        res.push(...children);
      }

      continue;
    }

    if(entry.isFile() && SQL_MIGRATION_FILE_PATTERN.test(entry.name)) {
      res.push({
        fullPath,
        filename: entry.name,
      });
    }
  }

  return res;
}


interface IMigration {
  migration_id: string;
  sequence: number;
  filename: string;
  sort_index: number;
  executed_at: Date;
}

const PGCT_QUERY = `CREATE TABLE IF NOT EXISTS bgd_migrations (
  migration_id VARCHAR(100) NOT NULL UNIQUE PRIMARY KEY,
  sequence SERIAL NOT NULL,
  filename VARCHAR(255) NOT NULL UNIQUE,
  sort_index VARCHAR(4) NOT NULL,

  executed_at TIMESTAMPTZ NOT NULL
    DEFAULT (NOW() AT TIME ZONE 'UTC')
);`;


async function ensureTable_(driver: Database): Promise<void> {
  let text: string = "";

  switch(driver.dialect) {
    case "pgsql": {
      text = PGCT_QUERY;
    } break;
    default:
      throw new BGDException("[@@ensureTable_] Unknown or unsupported database dialect");
  }

  await driver.exec(text);
}

async function listExecuted_(driver: Database): Promise<readonly IMigration[]> {
  await ensureTable_(driver);
  const res = await driver.exec<IMigration>("SELECT * FROM bgd_migrations");

  if(res.isLeft()) {
    throw res.value;
  }

  return res.value.rows;
}
