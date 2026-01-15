
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


import { Pool, type PoolConfig, type PoolClient } from "pg";

import type { Dict } from "../types";
import { BGDException } from "../errors";
import { IAsyncDisposable } from "../lifecycle/disposable";
import { left, right, type Either } from "../lifecycle/either";
import type { ConnectionProps, DatabaseOptions } from "./core";
import { Database, IAbstractQueryResult, ITransaction } from "./database";


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface IPostgresResult<T = Dict<any>> extends IAbstractQueryResult<T> {
  readonly dialect: "pgsql";
}


export class Postgres extends Database implements IAsyncDisposable {
  #PoolI: Pool | null;
  #Disposed: boolean;
  #Options: Omit<DatabaseOptions, "replication">;
  #Conn: ConnectionProps | null;

  public constructor(conn: ConnectionProps, opts?: DatabaseOptions) {
    super();

    this.#Disposed = false;

    this.#Options = opts ?? {};
    delete (this.#Options as any).replication; // eslint-disable-line @typescript-eslint/no-explicit-any

    this.#Conn = conn;
  }

  public get dialect() {
    return "pgsql" as const;
  }

  public exec<T = Dict<unknown>>(
    query: string,
    values?: unknown[],
    options?: { transaction?: PoolClient; }
  ): Promise<Either<BGDException, IPostgresResult<T>>>;

  public exec<T = Dict<unknown>>(
    query: string,
    options?: { transaction?: PoolClient; values?: unknown[]; }
  ): Promise<Either<BGDException, IPostgresResult<T>>>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async exec<T = Dict<any>>(
    text: string,
    valuesOrOptions?: unknown[] | { transaction?: PoolClient; values?: unknown[] },
    options?: { transaction?: PoolClient },
  ): Promise<Either<BGDException, IPostgresResult<T>>> {
    let values: unknown[] | undefined = void 0;

    if(Array.isArray(valuesOrOptions)) {
      values = valuesOrOptions;
    } else {
      options = {
        transaction: valuesOrOptions?.transaction,
      };

      values = valuesOrOptions?.values;
      valuesOrOptions = null!;
    }

    let client: PoolClient | null = null;

    try {
      client = options?.transaction ?? await this.#GetConnection();

      const result = await client.query({
        text,
        values,
      });

      return right({
        dialect: "pgsql",
        command: result.command,
        rowCount: result.rowCount,
        rows: result.rows,
        oid: result.oid,
        queryText: text,
      });
    } catch (err: unknown) {
      let e: BGDException = err as BGDException;

      if(!(err instanceof BGDException)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        e = new BGDException(`[Postgres] Query execution was failed due to: ${(err as any)?.message || String(err) || "Unknown error"}`);
      }

      return left(e);
    } finally {
      if(client != null && !options?.transaction) {
        client.release();
      }
    }
  }

  public createTransaction(o?: TransactionOptions): Promise<PostgresTransaction> {
    this.#CheckDisposed();
    return PostgresTransaction.create(this, o);
  }

  public async dispose(): Promise<void> {
    if(!this.#Disposed) {
      try {
        await this.#PoolI?.end();
      } catch (err) {
        console.error(err);
      }
      
      this.#Disposed = true;
    }
  }

  async #GetConnection(): Promise<PoolClient> {
    if(this.#PoolI == null) {
      if(!this.#Conn) {
        throw new BGDException("[Postgres] Missing connection info for database");
      }

      if(typeof this.#Conn === "object" && "get" in this.#Options) {
        throw new BGDException("[Postgres] Use of secure getters aren't supported yet");
      }

      const config: PoolConfig = {
        ssl: this.#Options?.ssl,
        allowExitOnIdle: true,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: this.#Options?.connectionTimeout ?? 2000,
      };

      if(typeof this.#Conn === "string") {
        config.connectionString = this.#Conn;
      } else if(typeof this.#Conn === "object" && "host" in this.#Conn) {
        if(typeof this.#Conn.password === "object") {
          throw new BGDException("[Postgres] Use of secure getters aren't supported yet");
        }

        config.host = this.#Conn.host;
        config.port = this.#Conn.port;
        config.password = this.#Conn.password;
        config.database = this.#Conn.database;
        config.user = this.#Conn.username;
      } else {
        throw new BGDException("[Postgres] Something is wrong with connection info");
      }

      this.#Conn = null;
      this.#PoolI = new Pool(config);
    }

    return await this.#PoolI.connect();
  }

  #CheckDisposed(): void {
    if(this.#Disposed) {
      throw new BGDException("[Postgres] Database has already disposed", "ER_RESOURCE_DISPOSED");
    }
  }
}


export type TransactionOptions = {
  autoCommit?: boolean;
  allowQueryBatch?: boolean;
};

export class PostgresTransaction implements ITransaction {
  public static async create(c: Postgres, o?: TransactionOptions): Promise<PostgresTransaction> {
    await c.exec("BEGIN");
    return new PostgresTransaction(c, o);
  }

  #Finished: boolean;
  #Client: Postgres;
  #Options: TransactionOptions;

  private constructor(
    client: Postgres,
    options?: TransactionOptions // eslint-disable-line comma-dangle
  ) {
    this.#Finished = false;
    this.#Client = client;
    this.#Options = options ?? {};
  }

  public async commit(): Promise<void> {
    if(this.#Finished) return;

    await this.#Client.exec("COMMIT");
    this.#Finished = true;
  }

  public async rollback(): Promise<void> {
    if(this.#Finished) return;

    await this.#Client.exec("ROLLBACK");
    this.#Finished = true;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async exec<TResult = Dict<any>>(
    text: string,
    values?: unknown[] // eslint-disable-line comma-dangle
  ): Promise<Either<BGDException, IPostgresResult<TResult>>> {
    if(this.#Finished) {
      throw new BGDException("[PostgresTransaction] Current transaction is already closed");
    }

    const result = await this.#Client.exec<TResult>(text, values);

    if(result.isRight()) {
      if(this.#Options?.autoCommit) {
        await this.commit();
      }

      return result;
    }

    if(this.#Options?.autoCommit) {
      await this.rollback();
    }

    return result;
  }

  public async execBatch(
    queries: readonly {
      query: string;
      values?: unknown[];
    }[],
    options?: { onError?: "continue" | "break" } // eslint-disable-line comma-dangle
  ): Promise<readonly Either<BGDException, IPostgresResult>[]> {
    if(this.#Finished) {
      throw new BGDException("[PostgresTransaction] Current transaction is already closed");
    }

    if(!this.#Options?.allowQueryBatch) {
      throw new BGDException("[PostgresTransaction] Current transaction is not allowed to execute batch queries");
    }

    const oe = options?.onError ?? "break";

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result: Either<BGDException, IPostgresResult<Dict<any>>>[] = [];

      for(let i = 0; i < queries.length; ++i) {
        const res = await this.#Client.exec(queries[i].query, queries[i].values);
        
        if(res.isLeft() && oe !== "continue") {
          throw res.value;
        }

        result.push(res);
      }

      if(this.#Options?.autoCommit !== true)
        return result;

      const success = result.every(r => r.isRight());
      await this[success ? "commit" : "rollback"]();

      return result;
    } catch (err) {
      if(this.#Options.autoCommit) {
        await this.rollback();
      }

      throw err;
    }
  }
}
