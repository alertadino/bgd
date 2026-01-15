
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


import { ConnectionOptions } from "node:tls";

import { BGDException } from "../errors";
import { type Either } from "../lifecycle";


export const SQL_MIGRATION_FILE_PATTERN = /^(\d+)_(.*)\.migration\.sql$/;


export type ConnectionProps = string | { get(): Promise<Either<unknown, string>> | string } | {
  host: string;
  port?: number;
  username: string;
  password: string | { get(): Promise<Either<unknown, string>> | Either<unknown, string> };
  database: string;
};

export interface DatabaseOptions {
  ssl?: boolean | ConnectionOptions;
  connectionTimeout?: number;
  onError?: (err: BGDException) => unknown;
  verbose?: boolean;
  replication?: {
    master: ConnectionProps;
    slaves: readonly ConnectionProps[];
    replicationMode?: "slave" | "master";
  } | false;
}
