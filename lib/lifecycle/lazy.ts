
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * 
 * Modified in 2025 by Alerta Dino's IT Team.
 * 
 * This code was released under the BSD 3-Clause License.
 * See the "LICENSE" file under project root.
 * 
 * @see https://github.com/microsoft/vscode/blob/main/LICENSE.txt
 * 
 * @author (PUBLIC_ID) 1D-C2-9B-98-D6-C3-D6-AB
 * @signphrase It was created on Earth by humans, although
 *             I can't define what a "human" is.
 */


import { BGDException } from "../errors";


/**
 * A function that takes no arguments and returns a value of type `T`.
 */
export type LazyExecutor<T> = () => T;

/**
 * A lazy value.
 *
 * The lazy value is calculated once on first access and then cached.
 *
 * @param T The type of the lazy value.
 */
export class Lazy<T> {
  private _error: BGDException | undefined;
  private _didRun: boolean = false;
  private _value?: T;
  
  public constructor(private readonly _executor: LazyExecutor<T>) { }

  /**
   * True if the lazy value has been resolved.
   */
  public get hasValue() { return this._didRun; }

  /**
   * Get the wrapped value.
   *
   * This will force evaluation of the lazy value if it has not been resolved yet. Lazy values are only
   * resolved once. `getValue` will re-throw exceptions that are hit while resolving the value
   */
  public get value(): T {
    if(!this._didRun) {
      try {
        this._value = this._executor();
      } catch(err: unknown) {
        let e: BGDException = err as BGDException;

        if(!(err instanceof BGDException)) {
          e = new BGDException(`[Lazy] ${(err as { message?: string })?.message || String(err)}`);
        }

        this._error = e;
      } finally {
        this._didRun = true;
      }
    }

    if(this._error) {
      throw this._error;
    }

    return this._value!;
  }

  /**
   * Get the wrapped value without forcing evaluation.
   */
  public get rawValue(): T | undefined {
    return this._value;
  }

  public map<R>(fn: (value: T) => R): Lazy<R> {
    return new Lazy(() => fn(this.value));
  }

  public cleanup(): void {
    this._value = null!;
    this._error = void 0;
    this._didRun = false;
  }

  public dispose(): void {
    this._value = null!;
    this._error = new BGDException("[Lazy] Resource is currently disposed", "ER_RESOURCE_DISPOSED");
  }
}


export class AsyncLazy<T> {
  private _value: T | undefined;
  private _didRun: boolean = false;
  private _error: Error | null = null;
  private _promise: Promise<T> | null = null;

  public constructor(
    private readonly _executor: () => Promise<T> // eslint-disable-line comma-dangle
  ) { }

  public get hasValue(): boolean {
    return this._didRun;
  }

  public get rawValue(): T | undefined {
    return this._value;
  }

  public get value(): Promise<T> {
    if(this._didRun) {
      if(!this._error)
        return Promise.resolve(this._value!);

      return Promise.reject(this._error);
    }

    if(!this._promise) {
      this._promise = this._executor()
        .then(result => {
          this._value = result;
          return result;
        }, err => {
          this._error = err;
          throw err;
        })
        .finally(() => {
          this._didRun = true;
        });
    }

    return this._promise;
  }

  public dispose(): void {
    this._value = null!;
    this._error = new BGDException("[AsyncLazy] Resource is currently disposed", "ER_RESOURCE_DISPOSED");
  }

  public map<R>(fn: (value: Promise<T>) => Promise<R>): AsyncLazy<R> {
    return new AsyncLazy(() => fn(this.value));
  }

  public async mapAsync<R>(fn: (value: T) => Promise<R>): Promise<AsyncLazy<R>> {
    const x = await this.value;
    return new AsyncLazy(() => fn(x));
  }
}
