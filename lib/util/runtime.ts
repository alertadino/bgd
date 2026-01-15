
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
import { MemoryBuffer } from "../allocators";


export function toInt(n: number): number {
  return ~~n;
}

export function toBuffer(chunk: unknown): MemoryBuffer {
  if(chunk instanceof MemoryBuffer)
    return chunk;

  let target: Buffer | null = Buffer.isBuffer(chunk) ? chunk : null;

  if(typeof chunk === "string") {
    target = Buffer.from(chunk);
  }
  
  if(chunk instanceof ArrayBuffer) {
    target = Buffer.from(chunk);
  }
  
  if(chunk instanceof Uint8Array) {
    target = Buffer.from(chunk);
  }
  
  if(chunk instanceof Uint16Array) {
    target = Buffer.from(chunk);
  }
  
  if(chunk instanceof Uint32Array) {
    target = Buffer.from(chunk);
  }
  
  if(chunk instanceof Int8Array) {
    target = Buffer.from(chunk);
  }
  
  if(chunk instanceof Int16Array) {
    target = Buffer.from(chunk);
  }
  
  if(chunk instanceof Int32Array) {
    target = Buffer.from(chunk);
  }
  
  if(chunk instanceof Float32Array) {
    target = Buffer.from(chunk);
  }
  
  if(chunk instanceof Float64Array) {
    target = Buffer.from(chunk);
  }
  
  if(chunk instanceof SharedArrayBuffer) {
    target = Buffer.from(chunk);
  }
  
  if(chunk instanceof DataView) {
    target = Buffer.from(chunk.buffer, chunk.byteOffset, chunk.byteLength);
  }

  if(ArrayBuffer.isView(chunk)) {
    target = Buffer.from(chunk.buffer, chunk.byteOffset, chunk.byteLength);
  }

  if(Array.isArray(chunk) && chunk.every(x => typeof x === "number")) {
    target = Buffer.from(chunk);
  }

  if(!target || !Buffer.isBuffer(target)) {
    throw new BGDException(`[@@toBuffer] Failed to cast 'typeof ${typeof chunk}' to binary data`, "ER_INVALID_ARGUMENT");
  }

  const out = MemoryBuffer.alloc(target.length);

  for(let i = 0; i < target.length; ++i) {
    out.setByte(i, target[i]);
  }

  target.fill(0);
  target = null!;

  return out;
}
