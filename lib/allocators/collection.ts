
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


import { assertType } from "../util";
import { MemoryBuffer } from "./buffer";
import { BGDException } from "../errors";
import { Disposable } from "../lifecycle/disposable";
import { type Either, left, right } from "../lifecycle/either";


export class CollectionAllocator extends Disposable {
  #Size: number;
  #MaxBytes: number;
  #Disposed: boolean;

  public constructor(maxSize?: number) {
    if(typeof maxSize !== "undefined" && maxSize != null) {
      assertType("uint32", maxSize, "[CollectionAllocator] Max size must be a 32-bits unsigned integer");
    }

    super();

    this.#Size = 0;
    this.#MaxBytes = maxSize ?? -1;
    this.#Disposed = false;
  }

  public get byteLength(): number {
    return this.#Size;
  }

  public get maxBytes(): number {
    return this.#MaxBytes;
  }

  public get freeBytes(): number {
    return this.#MaxBytes - this.#Size;
  }

  public alloc(size: number): Either<BGDException, MemoryBuffer> {
    if(this.#Disposed) {
      const err = new BGDException(
        "[CollectionAllocator] The collection has already been disposed",
        "ER_RESOURCE_DISPOSED" // eslint-disable-line comma-dangle
      );
      
      return left(err);
    }

    if(size + this.#Size > this.#MaxBytes) {
      const err = new BGDException(
        `[CollectionAllocator] There's not enough space to alloc ${size} bytes`,
        "ER_BUFFER_OVERFLOW" // eslint-disable-line comma-dangle
      );
      
      return left(err);
    }

    try {
      const buf = MemoryBuffer.alloc(size);

      this.#Size += buf.byteLength;
      return right( super._register(buf) );
    } catch (err: unknown) {
      let e: BGDException = err as BGDException;

      if(!(err instanceof BGDException)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        e = new BGDException(`[CollectionAllocator] Failed to allocate buffer due to: ${(err as any)?.message || String(err) || "Unknown error"}`);
      }

      return left(e);
    }
  }

  public free(buf: MemoryBuffer): boolean {
    const size = buf.byteLength;

    /** _delete() removes the object reference and call dispose() from it */
    const r = super._delete( buf );

    if(r) {
      this.#Size -= size;
    }

    return r;
  }

  public override dispose(): void {
    super.dispose();

    this.#Size = 0;
    this.#Disposed = true;
  }
}
