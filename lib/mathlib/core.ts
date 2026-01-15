
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

/* eslint-disable @typescript-eslint/no-namespace, no-inner-declarations */


export namespace MathLib {
  type ZipResult<T extends unknown[][]> = {
    [K in keyof T]: T[K] extends (infer U)[] ? U : never
  }[];

  export function zip<T extends unknown[][]>(...args: T): ZipResult<T> {
    const minLen = Math.min(...args.map(arr => arr.length));
    const result = new Array(minLen);

    for(let i = 0; i < minLen; ++i) {
      result[i] = args.map(arr => arr[i]);
    }

    return result;
  }

  export function uniform(
    start: number,
    end?: number,
    rule?: "round" | "ceil" | "floor" // eslint-disable-line comma-dangle
  ): number {
    if(!end || end < start) {
      end = start;
      start = 0;
    }

    const rand = Math.random() * (end - start) + start;

    if(
      !rule ||
      (
        rule !== "round" &&
        rule !== "ceil" &&
        rule !== "floor"
      )
    ) return rand;

    return Math[rule](rand);
  }
  
  export function clamp(x: number, min: number, max: number): number {
    return Math.min(Math.max(x, min), max);
  }
}
