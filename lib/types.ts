
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


/** Represents a struct (object with string keys) */
export type Dict<T> = {
  [key: string]: T;
};

export type BufferLike =
  | Buffer
  | string
  | ArrayBuffer
  | Uint8Array
  | Uint16Array
  | Uint32Array
  | SharedArrayBuffer
  | ArrayBufferView
  | DataView
  | readonly number[];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GenericFunction = (...args: any[]) => unknown;

export type MaybePromise<T> = T | Promise<T>;
