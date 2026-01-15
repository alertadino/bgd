
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


// Galois Field (GF( 2 ^ 8 )) Arithmetic with
// Rijndael finite field polynomial: x^8 + x^4 + x^3 + x + 1 (0x11B)


/* eslint-disable @typescript-eslint/no-namespace, no-inner-declarations */

import { BGDException } from "../errors";


export function gf_add(a: number, b: number): number {
  return a ^ b;
}

export function gf_sub(a: number, b: number): number {
  return a ^ b; // Identical to addition
}

/** Russian Peasant Multiplication for `GF( 2 ^ 8 )` */
export function gf_mul(a: number, b: number): number {
  let p: number = 0;
  let a_val: number = a;
  let b_val: number = b;

  for(let i = 0; i < 8; ++i) {
    if((b_val & 1) !== 0) {
      p ^= a_val;
    }

    const carry = (a_val & 0x80) !== 0;
    a_val <<= 1;

    if(carry) {
      a_val ^= 0x1B;
    }

    b_val >>= 1;
  }

  return p;
}

/** Modular Inverse: `a^(-1)` for `GF( 2 ^ 8 )` */
export function gf_inv(a: number): number {
  if(a === 0) {
    throw new BGDException("[@@gf_inv] Division by zero in GF(256)", "ER_INVALID_ARGUMENT");
  }

  let result: number = 1;
  let base: number = a;
  let exp: number = 0xFF - 1;

  while(exp > 0) {
    if(exp % 2 === 1) {
      result = gf_mul(result, base);
    }

    base = gf_mul(base, base);
    exp /= 2;
  }

  return result;
}

export function gf_div(a: number, b: number): number {
  return gf_mul(a, gf_inv(b));
}


export namespace GaloisFieldArithmetic {
  export function add(a: number, b: number): number {
    return gf_add(a, b);
  }

  export function sub(a: number, b: number): number {
    return gf_sub(a, b);
  }

  /** Russian Peasant Multiplication for `GF( 2 ^ 8 )` */
  export function mul(a: number, b: number): number {
    return gf_mul(a, b);
  }

  export function div(a: number, b: number): number {
    return gf_div(a, b);
  }

  /** Modular Inverse: `a^(-1)` for `GF( 2 ^ 8 )` */
  export function inv(a: number): number {
    return gf_inv(a);
  }
}
