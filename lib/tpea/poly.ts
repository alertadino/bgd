
/**
 * Copyright (c) Halfmoon Labs. All rights reserved.
 * 
 * Modified in 2025 by Alerta Dino's IT Team.
 * 
 * This code was released under the BSD 3-Clause License.
 * See the "LICENSE" file under project root.
 * 
 * @see https://github.com/shea256/secret-sharing/blob/master/secretsharing/polynomials.py
 * 
 * @author (PUBLIC_ID) 1D-C2-9B-98-D6-C3-D6-AB
 * @signphrase It was created on Earth by humans, although
 *             I can't define what a "human" is.
 */


import { randomInt } from "node:crypto";

import { MathLib } from "../mathlib";
import { assertType } from "../util";


export function egcd(a: number, b: number): readonly [number, number, number] {
  if(a === 0)
    return [b, 0, 1];

  const [g, y, x] = egcd(b % a, a);
  return [g, x - (b / a) * y, y];
}

export function modInv(k: number, prime: number): number {
  k = k % prime;

  const r = egcd(prime, k < 0 ? -k : k)[2];
  return (prime + r) % prime;
}

export function randomPolynomial(
  degree: number,
  intercept: number,
  upperBound: number // eslint-disable-line comma-dangle
): number[] {
  assertType("uint32", degree);
  const coefficients = [intercept];

  for(let i = 0; i < degree; ++i) {
    const rc = randomInt(upperBound - 1);
    coefficients.push(rc);
  }

  return coefficients;
}

export function getPolynomialPoints(
  c: readonly number[],
  points: number,
  prime: number // eslint-disable-line comma-dangle
): readonly [number, number][] {
  const res: [number, number][] = [];

  for(let x = 1; x < points + 1; ++x) {
    let y = c[0];

    for(let j = 1; j < c.length; ++j) {
      const exp = (x ** j) % prime;
      const term = (c[j] * exp) % prime;

      y = (y + term) % prime;
    }

    res.push([x, y]);
  }

  return res;
}

export function modularLagrangeInterpolation(
  x: number,
  points: readonly [number, number][],
  prime: number // eslint-disable-line comma-dangle
): number {
  const [xVals, yVals] = MathLib.zip(...points);
  let fx: number = 0;

  for(let i = 0; i < points.length; ++i) {
    let n = 1, d = 1;

    for(let j = 0; j < points.length; ++j) {
      if(j === i) continue;

      n = (n * (x - xVals[j])) % prime;
      d = (d * (xVals[i] - xVals[j])) % prime;
    }

    const lPol = n * modInv(d, prime);
    fx = (prime + fx + (yVals[i] * lPol)) % prime;
  }

  return fx;
}
