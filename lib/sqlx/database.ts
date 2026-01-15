
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


import { BGDException } from "../errors";
import { type Either } from "../lifecycle";
import type { Dict, MaybePromise } from "../types";


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface IAbstractQueryResult<T = Dict<any>> {
  readonly dialect: string;
  readonly command: string;
  readonly queryText?: string;
  readonly rowCount: number | null;
  readonly rows: T[];
  readonly oid?: number;
}


export interface ITransaction {
  commit(): MaybePromise<void>;
  rollback(): MaybePromise<void>;

  exec<TResult>(
    text: string,
    values?: unknown[] // eslint-disable-line comma-dangle
  ): MaybePromise<Either<BGDException, IAbstractQueryResult<TResult>>>;

  execBatch(
    queries: readonly {
      query: string;
      values?: unknown[];
    }[],
    options?: { onError?: "continue" | "break" } // eslint-disable-line comma-dangle
  ): MaybePromise<readonly Either<BGDException, IAbstractQueryResult>[]>
}

export abstract class Database {
  public abstract readonly dialect: string;

  public get type(): "sql" {
    return "sql" as const;
  }

  public abstract exec<T = Dict<unknown>>(
    query: string,
    values?: unknown[],
    options?: { transaction?: unknown }
  ): MaybePromise<Either<BGDException, IAbstractQueryResult<T>>>;

  public abstract exec<T = Dict<unknown>>(
    query: string,
    options?: { transaction?: unknown; values?: unknown[] }
  ): MaybePromise<Either<BGDException, IAbstractQueryResult<T>>>;

  public abstract createTransaction(o?: Dict<unknown>): MaybePromise<ITransaction>;

  public abstract dispose(): Promise<void> | void;
}
