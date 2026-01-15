
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


// import { assertType } from "../util";


export type Comparator<T> = (a: T, b: T) => number;
export type IsEqual<T> = (s: T, o: T) => boolean;


export abstract class Heap<T> {

  // ABSTRACT INSTANCE METHODS

  public abstract readonly comparator: Comparator<T>;
  public abstract readonly capacity: number;

  public abstract push(item: T): void;


  // STATIC METHODS 

  public static getChildrenIndexOf(index: number): readonly [number, number] {
    return [ index * 2 + 1, index * 2 + 2 ];
  }

  public static getParentIndexOf(index: number): number {
    return index > 0 ? (index - 1) >> 1 : -1;
  }

  public static getSiblingIndexOf(index: number): number {
    if(index <= 0)
      return -1;

    return index + (index % 2 ? 1 : -1);
  }

  public static minComparator<N>(a: N, b: N): number {
    if(a > b)
      return 1;

    if(a < b)
      return -1;

    return 0;
  }

  public static maxComparator<N>(a: N, b: N): number {
    if(b > a)
      return 1;

    if(b < a)
      return -1;

    return 0;
  }
}
