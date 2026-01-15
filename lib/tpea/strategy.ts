
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


// The Philosopher Extension Algorithm
// A custom implementation of Shamir's Secret Sharing
// ---------------------------------------------------------------------

// Input (plain text)       ->  f(n, k)    ->  [n slices of cipher text]
// Input (cipher_slice[n])  ->  f(n >= k)  ->  [plain text]

// WHERE:

// `f()`  is the secret redactor/unwrapper function
// `n`    is the number of input/output slices
// `k`    is the minimun required slices to recover original payload


import { randomBytes } from "node:crypto";

import { toBuffer } from "../util";
import { MathLib } from "../mathlib";
import { BGDException } from "../errors";
import type { BufferLike } from "../types";
import { MemoryBuffer } from "../allocators";
import { IDebugString } from "../lifecycle/debugger";
import { IDisposable } from "../lifecycle/disposable";
import { EFFLongWordList } from "../util/wordlist-dictionary";


export const enum ChunkType {
  SliceContainingHeaderChunk     =  0xFC,
  SliceContainingHeaderContent   =  0xED,
  SignificantSliceDerived1       =  0x79,
  SignificantSliceDerived2       =  0xA0,
  InsignificantSliceOfData       =  0x56,
}


export class Chunk implements IDebugString, IDisposable {
  public static ofHeader(id: number, header: BufferLike | MemoryBuffer): Chunk {
    return new Chunk(id, ChunkType.SliceContainingHeaderChunk, toBuffer(header));
  }

  public static ofHeaderContent(id: number, header: BufferLike | MemoryBuffer): Chunk {
    return new Chunk(id, ChunkType.SliceContainingHeaderContent, toBuffer(header));
  }

  public static ofDerived1(id: number, header: BufferLike | MemoryBuffer): Chunk {
    return new Chunk(id, ChunkType.SignificantSliceDerived1, toBuffer(header));
  }

  public static ofDerived2(id: number, header: BufferLike | MemoryBuffer): Chunk {
    return new Chunk(id, ChunkType.SignificantSliceDerived2, toBuffer(header));
  }

  public static ofInsignificant(id: number, len: number): Chunk {
    let cursor: number = -1;
    const dict: string[] = [];

    do {
      const idx = MathLib.uniform(0, EFFLongWordList.value.length - 1, "round");
      const word = EFFLongWordList.value[idx];
      
      dict.push(word);
      cursor += Buffer.byteLength(word) + 1;
    } while(cursor < len);

    EFFLongWordList.cleanup();
       
    do {
      const word = dict.shift();
      cursor -= Buffer.byteLength(word!) + 1;
    } while(cursor >= len);

    const diff = len - cursor;

    if(diff === 0) {
      throw new BGDException("[Chunk] Failed to create dictionary of random words");
    }

    const padChunk = randomBytes(diff);
    let buffer: Buffer;

    if(padChunk.length > 6) {
      const mid = Math.floor(padChunk.length / 2);

      buffer = Buffer.concat([
        padChunk.subarray(0, mid),
        Buffer.from(dict.join("\n")),
        padChunk.subarray(mid),
      ]);
    } else {
      buffer = Buffer.concat([ padChunk, Buffer.from(dict.join("\n")) ]);
    }

    const memBuf = MemoryBuffer.alloc(buffer.length);

    for(let i = 0; i < buffer.length; ++i) {
      memBuf.setByte(i, buffer[i]);
    }

    buffer.fill(0);
    buffer = null!;

    return new Chunk(id, ChunkType.InsignificantSliceOfData, memBuf);
  }

  readonly #Type: ChunkType;
  readonly #ID: number;
  #Payload: MemoryBuffer;
  #Disposed: boolean;

  public constructor(
    id: number,
    typeid: ChunkType,
    payload: MemoryBuffer // eslint-disable-line comma-dangle
  ) {
    this.#ID = id;
    this.#Type = typeid;
    this.#Payload = payload;
    this.#Disposed = false;
  }

  public get id(): number {
    return this.#ID;
  }

  public get type(): ChunkType {
    return this.#Type;
  }

  public get isDisposed(): boolean {
    return this.#Disposed;
  }

  public $$debug(r?: true): string;
  public $$debug(r: false): void;
  public $$debug(r?: boolean): string | void {
    let str = "Chunk ";

    if(this.#Disposed) {
      str += "(__disposed__)";
    } else {
      str += `(0x${this.#Type.toString(16).toUpperCase()}, `;
      str += `0x${this.#Payload.byteLength.toString(16).toUpperCase()}) `;
    
      str += `{ ${this.#Payload.toString("latin1")} }`;
    }

    if(r === false) {
      console.log(str);
      return;
    }

    return str;
  }

  public dispose(): void {
    if(!this.#Disposed) {
      this.#Payload.dispose();
      this.#Disposed = true;
    }
  }

  #CheckDisposed(): void {
    if(this.#Disposed) {
      throw new BGDException("[Chunk] Object has already been disposed", "ER_RESOURCE_DISPOSED");
    }
  }
}
