
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


import { type ImplicitArrayBuffer, type WithImplicitCoercion } from "node:buffer";

import { assert } from "../util";
import { BGDException } from "../errors";
import { IDebugString } from "../lifecycle/debugger";
import { IDisposable } from "../lifecycle/disposable";


/** 
 * Provides a scoped wrapper around Node `Buffer` with
 * explicit zeroization and access checks.
 */
export class MemoryBuffer<
  T extends ArrayBuffer | SharedArrayBuffer = ArrayBufferLike
> implements IDisposable, IDebugString {

  /**
   * Allocates a new zero-filled `Buffer` in heap.
   */
  public static alloc( sizeInBytes: number ): MemoryBuffer<ArrayBuffer> {
    return new MemoryBuffer( Buffer.alloc(sizeInBytes) );
  }

  /**
   * Using `from()` method may allocate a oversized buffer.
   * 
   * It also can share memory with an external resource when
   * called with `ArrayBuffer` instance, invalidating disposal logic.
   * 
   * @advice
   * Prefer to use`alloc()` with specific needed memory size.
   */
  public static from(string: WithImplicitCoercion<string>, encoding?: BufferEncoding): MemoryBuffer<ArrayBuffer>;

  /**
   * Using `from()` method may allocate a oversized buffer.
   * 
   * It also can share memory with an external resource when
   * called with `ArrayBuffer` instance, invalidating disposal logic.
   * 
   * @advice
   * Prefer to use`alloc()` with specific needed memory size.
   */
  public static from(arrayOrString: WithImplicitCoercion<ArrayLike<number> | string>): MemoryBuffer<ArrayBuffer>;

  /**
   * Using `from()` method may allocate a oversized buffer.
   * 
   * It also can share memory with an external resource when
   * called with `ArrayBuffer` instance, invalidating disposal logic.
   * 
   * @advice
   * Prefer to use`alloc()` with specific needed memory size.
   */
  public static from(array: WithImplicitCoercion<ArrayLike<number>>): MemoryBuffer<ArrayBuffer>;

  public static from<TArrayBuffer extends WithImplicitCoercion<ArrayBufferLike>>(
    arrayBuffer: TArrayBuffer,
    byteOffset?: number,
    length?: number,
  ): MemoryBuffer<ImplicitArrayBuffer<TArrayBuffer>>;

  public static from(
    arg_0: unknown,
    arg_1?: unknown,
    arg_2?: unknown // eslint-disable-line comma-dangle
  ): MemoryBuffer<ArrayBuffer> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new MemoryBuffer( Buffer.from(arg_0 as any, arg_1 as any, arg_2 as any) );
  }

  #BufRef: Buffer<T> | null;

  private constructor( buf: Buffer<T> ) {
    if(!Buffer.isBuffer(buf)) {
      throw new BGDException(
        `[MemoryBuffer] Cannot construct a memory buffer with given 'typeof ${typeof buf}'`,
        "ER_INVALID_ARGUMENT" // eslint-disable-line comma-dangle
      );
    }

    assert(buf.byteLength === buf.length, "[MemoryBuffer] bytes-per-element=1");
    this.#BufRef = buf;
  }

  public get byteLength(): number {
    this.#CheckDisposed();
    return this.#BufRef!.byteLength;
  }

  public get byteOffset(): number {
    this.#CheckDisposed();
    return this.#BufRef!.byteOffset;
  }

  public get disposed(): boolean {
    return this.#BufRef == null;
  }

  public setByte(index: number, val: number): void {
    if(typeof index !== "number" || isNaN(index)) {
      throw new BGDException(
        "[MemoryBuffer] Array index must be a unsigned integer",
        "ER_INVALID_ARGUMENT" // eslint-disable-line comma-dangle
      );
    }

    if(typeof val !== "number" || isNaN(val)) {
      throw new BGDException(
        "[MemoryBuffer] The value \"byte\" must be a integer number",
        "ER_INVALID_ARGUMENT" // eslint-disable-line comma-dangle
      );
    }

    this.#CheckDisposed();
    this.#BufRef![index] = val;
  }

  public getByte(index: number): number {
    if(typeof index !== "number" || isNaN(index)) {
      throw new BGDException(
        "[MemoryBuffer] Array index must be a unsigned integer",
        "ER_INVALID_ARGUMENT" // eslint-disable-line comma-dangle
      );
    }

    this.#CheckDisposed();
    return this.#BufRef![index];
  }

  // WRITE
  public writeUint8(val: number, offset?: number): number {
    this.#CheckDisposed();
    return this.#BufRef!.writeUInt8(val, offset);
  }

  public writeInt8(val: number, offset?: number): number {
    this.#CheckDisposed();
    return this.#BufRef!.writeInt8(val, offset);
  }

  public writeUint16(val: number, offset?: number, enc: "BE" | "LE" = "LE"): number {
    this.#CheckDisposed();

    if(enc !== "BE" && enc !== "LE") {
      throw new BGDException(
        `[MemoryBuffer] Unknown byte encoding "${enc}", expecting little-endian (LE) or big-endian (BE)`,
        "ER_INVALID_ARGUMENT" // eslint-disable-line
      );
    }

    return this.#BufRef![`writeUInt16${enc}`](val, offset);
  }

  public writeInt16(val: number, offset?: number, enc: "BE" | "LE" = "LE"): number {
    this.#CheckDisposed();

    if(enc !== "BE" && enc !== "LE") {
      throw new BGDException(
        `[MemoryBuffer] Unknown byte encoding "${enc}", expecting little-endian (LE) or big-endian (BE)`,
        "ER_INVALID_ARGUMENT" // eslint-disable-line
      );
    }

    return this.#BufRef![`writeInt16${enc}`](val, offset);
  }

  public writeUint32(val: number, offset?: number, enc: "BE" | "LE" = "LE"): number {
    this.#CheckDisposed();

    if(enc !== "BE" && enc !== "LE") {
      throw new BGDException(
        `[MemoryBuffer] Unknown byte encoding "${enc}", expecting little-endian (LE) or big-endian (BE)`,
        "ER_INVALID_ARGUMENT" // eslint-disable-line
      );
    }

    return this.#BufRef![`writeUInt32${enc}`](val, offset);
  }

  public writeInt32(val: number, offset?: number, enc: "BE" | "LE" = "LE"): number {
    this.#CheckDisposed();

    if(enc !== "BE" && enc !== "LE") {
      throw new BGDException(
        `[MemoryBuffer] Unknown byte encoding "${enc}", expecting little-endian (LE) or big-endian (BE)`,
        "ER_INVALID_ARGUMENT" // eslint-disable-line
      );
    }

    return this.#BufRef![`writeInt32${enc}`](val, offset);
  }

  public writeUint64(val: bigint, offset?: number, enc: "BE" | "LE" = "LE"): number {
    this.#CheckDisposed();

    if(enc !== "BE" && enc !== "LE") {
      throw new BGDException(
        `[MemoryBuffer] Unknown byte encoding "${enc}", expecting little-endian (LE) or big-endian (BE)`,
        "ER_INVALID_ARGUMENT" // eslint-disable-line
      );
    }

    return this.#BufRef![`writeBigUInt64${enc}`](val, offset);
  }

  public writeInt64(val: bigint, offset?: number, enc: "BE" | "LE" = "LE"): number {
    this.#CheckDisposed();

    if(enc !== "BE" && enc !== "LE") {
      throw new BGDException(
        `[MemoryBuffer] Unknown byte encoding "${enc}", expecting little-endian (LE) or big-endian (BE)`,
        "ER_INVALID_ARGUMENT" // eslint-disable-line
      );
    }

    return this.#BufRef![`writeBigInt64${enc}`](val, offset);
  }

  public writeFloat(val: number, offset?: number, enc: "BE" | "LE" = "LE"): number {
    this.#CheckDisposed();

    if(enc !== "BE" && enc !== "LE") {
      throw new BGDException(
        `[MemoryBuffer] Unknown byte encoding "${enc}", expecting little-endian (LE) or big-endian (BE)`,
        "ER_INVALID_ARGUMENT" // eslint-disable-line
      );
    }

    return this.#BufRef![`writeFloat${enc}`](val, offset);
  }

  public writeDouble(val: number, offset?: number, enc: "BE" | "LE" = "LE"): number {
    this.#CheckDisposed();

    if(enc !== "BE" && enc !== "LE") {
      throw new BGDException(
        `[MemoryBuffer] Unknown byte encoding "${enc}", expecting little-endian (LE) or big-endian (BE)`,
        "ER_INVALID_ARGUMENT" // eslint-disable-line
      );
    }

    return this.#BufRef![`writeDouble${enc}`](val, offset);
  }
  // END WRITE

  // READ
  public readUint8(offset?: number): number {
    this.#CheckDisposed();
    return this.#BufRef!.readUInt8(offset);
  }

  public readInt8(offset?: number): number {
    this.#CheckDisposed();
    return this.#BufRef!.readInt8(offset);
  }

  public readUint16(offset?: number, enc: "BE" | "LE" = "LE"): number {
    this.#CheckDisposed();

    if(enc !== "BE" && enc !== "LE") {
      throw new BGDException(
        `[MemoryBuffer] Unknown byte encoding "${enc}", expecting little-endian (LE) or big-endian (BE)`,
        "ER_INVALID_ARGUMENT" // eslint-disable-line comma-dangle
      );
    }

    return this.#BufRef![`readUInt16${enc}`](offset);
  }

  public readInt16(offset?: number, enc: "BE" | "LE" = "LE"): number {
    this.#CheckDisposed();

    if(enc !== "BE" && enc !== "LE") {
      throw new BGDException(
        `[MemoryBuffer] Unknown byte encoding "${enc}", expecting little-endian (LE) or big-endian (BE)`,
        "ER_INVALID_ARGUMENT" // eslint-disable-line comma-dangle
      );
    }

    return this.#BufRef![`readInt16${enc}`](offset);
  }

  public readUint32(offset?: number, enc: "BE" | "LE" = "LE"): number {
    this.#CheckDisposed();

    if(enc !== "BE" && enc !== "LE") {
      throw new BGDException(
        `[MemoryBuffer] Unknown byte encoding "${enc}", expecting little-endian (LE) or big-endian (BE)`,
        "ER_INVALID_ARGUMENT" // eslint-disable-line comma-dangle
      );
    }

    return this.#BufRef![`readUInt32${enc}`](offset);
  }

  public readInt32(offset?: number, enc: "BE" | "LE" = "LE"): number {
    this.#CheckDisposed();

    if(enc !== "BE" && enc !== "LE") {
      throw new BGDException(
        `[MemoryBuffer] Unknown byte encoding "${enc}", expecting little-endian (LE) or big-endian (BE)`,
        "ER_INVALID_ARGUMENT" // eslint-disable-line comma-dangle
      );
    }

    return this.#BufRef![`readInt32${enc}`](offset);
  }

  public readUint64(offset?: number, enc: "BE" | "LE" = "LE"): bigint {
    this.#CheckDisposed();

    if(enc !== "BE" && enc !== "LE") {
      throw new BGDException(
        `[MemoryBuffer] Unknown byte encoding "${enc}", expecting little-endian (LE) or big-endian (BE)`,
        "ER_INVALID_ARGUMENT" // eslint-disable-line comma-dangle
      );
    }

    return this.#BufRef![`readBigUInt64${enc}`](offset);
  }

  public readInt64(offset?: number, enc: "BE" | "LE" = "LE"): bigint {
    this.#CheckDisposed();

    if(enc !== "BE" && enc !== "LE") {
      throw new BGDException(
        `[MemoryBuffer] Unknown byte encoding "${enc}", expecting little-endian (LE) or big-endian (BE)`,
        "ER_INVALID_ARGUMENT" // eslint-disable-line comma-dangle
      );
    }

    return this.#BufRef![`readBigInt64${enc}`](offset);
  }

  public readFloat(offset?: number, enc: "BE" | "LE" = "LE"): number {
    this.#CheckDisposed();

    if(enc !== "BE" && enc !== "LE") {
      throw new BGDException(
        `[MemoryBuffer] Unknown byte encoding "${enc}", expecting little-endian (LE) or big-endian (BE)`,
        "ER_INVALID_ARGUMENT" // eslint-disable-line comma-dangle
      );
    }

    return this.#BufRef![`readFloat${enc}`](offset);
  }

  public readDouble(offset?: number, enc: "BE" | "LE" = "LE"): number {
    this.#CheckDisposed();

    if(enc !== "BE" && enc !== "LE") {
      throw new BGDException(
        `[MemoryBuffer] Unknown byte encoding "${enc}", expecting little-endian (LE) or big-endian (BE)`,
        "ER_INVALID_ARGUMENT" // eslint-disable-line comma-dangle
      );
    }

    return this.#BufRef![`readDouble${enc}`](offset);
  }
  // END READ

  public copy(
    target: Uint8Array | MemoryBuffer<ArrayBufferLike>,
    targetStart?: number,
    sourceStart?: number,
    sourceEnd?: number // eslint-disable-line comma-dangle
  ): number {
    this.#CheckDisposed();

    if(target instanceof MemoryBuffer && target.#BufRef == null) {
      throw new BGDException(
        "[MemoryBuffer] Access to target buffer is not allowed because it's already disposed",
        "ER_RESOURCE_DISPOSED" // eslint-disable-line comma-dangle
      );
    }

    return this.#BufRef!.copy(
      target instanceof MemoryBuffer
        ? target.#BufRef!
        : target,
      targetStart,
      sourceStart,
      sourceEnd // eslint-disable-line comma-dangle
    );
  }

  public indexOf(
    value: string | number | Uint8Array | MemoryBuffer<ArrayBufferLike>,
    encoding: BufferEncoding
  ): number;

  public indexOf(
    value: string | number | Uint8Array | MemoryBuffer<ArrayBufferLike>,
    byteOffset?: number,
    encoding?: BufferEncoding
  ): number;

  public indexOf(
    value: string | number | Uint8Array | MemoryBuffer<ArrayBufferLike>,
    byteOffsetOrEnc?: number | BufferEncoding,
    encoding?: BufferEncoding // eslint-disable-line comma-dangle
  ): number {
    this.#CheckDisposed();

    if(value instanceof MemoryBuffer && value.#BufRef == null) {
      throw new BGDException(
        "[MemoryBuffer] Access to target buffer is not allowed because it's already disposed",
        "ER_RESOURCE_DISPOSED" // eslint-disable-line comma-dangle
      );
    }

    if(
      !!byteOffsetOrEnc &&
      typeof byteOffsetOrEnc !== "number" &&
      !Buffer.isBuffer(byteOffsetOrEnc)
    ) {
      throw new BGDException(
        `[MemoryBuffer] Unknown element byte-offset (as \`${byteOffsetOrEnc}\`)`,
        "ER_INVALID_ARGUMENT" // eslint-disable-line comma-dangle
      );
    }

    return this.#BufRef!.indexOf(
      value instanceof MemoryBuffer
        ? value.#BufRef!
        : value,
      byteOffsetOrEnc as undefined,
      encoding // eslint-disable-line comma-dangle
    );
  }

  public lastIndexOf(
    value: string | number | Uint8Array | MemoryBuffer<ArrayBufferLike>,
    encoding: BufferEncoding
  ): number;

  public lastIndexOf(
    value: string | number | Uint8Array | MemoryBuffer<ArrayBufferLike>,
    byteOffset?: number,
    encoding?: BufferEncoding
  ): number;

  public lastIndexOf(
    value: string | number | Uint8Array | MemoryBuffer<ArrayBufferLike>,
    byteOffsetOrEnc?: number | BufferEncoding,
    encoding?: BufferEncoding // eslint-disable-line comma-dangle
  ): number {
    this.#CheckDisposed();

    if(value instanceof MemoryBuffer && value.#BufRef == null) {
      throw new BGDException(
        "[MemoryBuffer] Access to target buffer is not allowed because it's already disposed",
        "ER_RESOURCE_DISPOSED" // eslint-disable-line comma-dangle
      );
    }

    if(
      !!byteOffsetOrEnc &&
      typeof byteOffsetOrEnc !== "number" &&
      !Buffer.isBuffer(byteOffsetOrEnc)
    ) {
      throw new BGDException(
        `[MemoryBuffer] Unknown element byte-offset (as \`${byteOffsetOrEnc}\`)`,
        "ER_INVALID_ARGUMENT" // eslint-disable-line comma-dangle
      );
    }

    return this.#BufRef!.lastIndexOf(
      value instanceof MemoryBuffer
        ? value.#BufRef!
        : value,
      byteOffsetOrEnc as undefined,
      encoding // eslint-disable-line comma-dangle
    );
  }

  public compare(
    target: Uint8Array | MemoryBuffer<ArrayBufferLike>,
    targetStart?: number,
    targetEnd?: number,
    sourceStart?: number,
    sourceEnd?: number // eslint-disable-line comma-dangle
  ): -1 | 0 | 1 {
    this.#CheckDisposed();

    if(target instanceof MemoryBuffer && target.#BufRef == null) {
      throw new BGDException(
        "[MemoryBuffer] Access to target buffer is not allowed because it's already disposed",
        "ER_RESOURCE_DISPOSED" // eslint-disable-line comma-dangle
      );
    }
    
    return this.#BufRef!.compare(
      target instanceof MemoryBuffer
        ? target.#BufRef!
        : target,
      targetStart,
      targetEnd,
      sourceStart,
      sourceEnd // eslint-disable-line comma-dangle
    );
  }

  public equals(other: Uint8Array | MemoryBuffer<ArrayBufferLike>): boolean {
    this.#CheckDisposed();

    if(other instanceof MemoryBuffer && other.#BufRef == null) {
      throw new BGDException(
        "[MemoryBuffer] Access to target buffer is not allowed because it's already disposed",
        "ER_RESOURCE_DISPOSED" // eslint-disable-line comma-dangle
      );
    }

    return this.#BufRef!.equals(other instanceof MemoryBuffer ? other.#BufRef! : other);
  }

  public reverse(): this {
    this.#CheckDisposed();

    this.#BufRef!.reverse();
    return this;
  }

  public toReversed(): MemoryBuffer<ArrayBuffer> {
    this.#CheckDisposed();

    let buf = this.#BufRef!.toReversed();
    const res = MemoryBuffer.alloc(buf.byteLength);

    for(let i = 0; i < buf.length; ++i) {
      res.setByte(i, buf[i]);
    }

    buf.fill(0);
    buf = null!;

    return res;
  }

  public subarray(start?: number, end?: number): MemoryBuffer<T> {
    this.#CheckDisposed();
    return new MemoryBuffer( this.#BufRef!.subarray(start, end) );
  }

  public toString(enc?: BufferEncoding, start?: number, end?: number): string {
    this.#CheckDisposed();
    return this.#BufRef!.toString(enc, start, end);
  }

  /**
   * **ATTENTION:** If you use this function make sure that
   * will not create an external reference of the buffer, or it'll
   * invalidate the disposal logic resulting in a memory leak.
   */
  public valueOf(secure?: true): Buffer;

  /**
   * **ATTENTION:** If you use this function make sure that
   * will not create an external reference of the buffer, or it'll
   * invalidate the disposal logic resulting in a memory leak.
   */
  public valueOf(secure: false): Buffer | null;
  
  public valueOf(secure?: boolean): Buffer | null {
    if(this.#BufRef == null) {
      if(secure !== false) {
        this.#CheckDisposed();
      }

      return null;
    }

    return this.#BufRef;
  }

  /**
   * **ATTENTION:** If you use this function make sure that
   * will not create an external reference of the buffer, or it'll
   * invalidate the disposal logic resulting in a memory leak.
   */
  public $ref(secure?: true): T;

  /**
   * **ATTENTION:** If you use this function make sure that
   * will not create an external reference of the buffer, or it'll
   * invalidate the disposal logic resulting in a memory leak.
   */
  public $ref(secure: false): T | null;
  
  public $ref(secure?: boolean): T | null {
    if(this.#BufRef == null) {
      if(secure !== false) {
        this.#CheckDisposed();
      }

      return null;
    }

    return this.#BufRef.buffer;
  }

  /**
   * Clear current buffer and free allocated memory.
   * 
   * **ATTENTION:** It won't work if the `MemoryBuffer` was created
   * from external memory. When you call `from()` with an `ArrayBuffer`
   * instance, or something like this, the owner of memory reference is the
   * external instance, so we can't dispose it.
   */
  public dispose(): void {
    if(this.#BufRef != null) {
      this.#BufRef.fill(0);
      this.#BufRef = null;
    }
  }

  public $$debug(r?: true): string;
  public $$debug(r: false): void;
  public $$debug(r?: boolean): string | void {
    let msg: string = "";

    if(this.#BufRef == null) {
      msg = "Buffer (__disposed__)";
    } else {
      msg = `Buffer (${this.#BufRef?.byteLength}) `;
      msg += `[ims=0xFF arraybuffer_size=${this.#BufRef.buffer.byteLength}]`;

      if(this.#BufRef.byteLength >= 4) {
        const left = [this.#BufRef[0].toString(16), this.#BufRef[1].toString(16)];
        const right = [this.#BufRef.at(-2)?.toString(16), this.#BufRef.at(-1)?.toString(16)];

        let moreInfo: string = "";

        if(this.#BufRef.byteLength > 4) {
          moreInfo = `... more ${this.#BufRef.byteLength - 4} bytes ... `;
        }

        msg += ` { ${left.map(i => `0x${i}`.toUpperCase()).join(", ")} ${moreInfo}${right.map(i => `0x${i}`.toUpperCase()).join(", ")} }`;
      } else {
        msg += ` { ${Array.from(this.#BufRef).map(i => `0x${i.toString(16).toUpperCase()}`).join(", ")} }`;
      }
    }

    if(r === false) {
      console.log(msg);
      return;
    }

    return msg;
  }

  #CheckDisposed(): void {
    if(this.#BufRef == null) {
      throw new BGDException(
        "[MemoryBuffer] Trying to access a slice of memory that has already disposed",
        "ER_RESOURCE_DISPOSED" // eslint-disable-line comma-dangle
      );
    }
  }
}
