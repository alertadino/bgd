
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

import {
  UINT16_RANGE,
  UINT32_RANGE,
  UINT8_RANGE, 
} from "../const";

import { BGDException } from "../errors";
import type { GenericFunction } from "../types";


type Tn = "uint8" | "uint16" | "uint32" | "func";

interface Tmap {
  uint8: number;
  uint16: number;
  uint32: number;
  func: GenericFunction;
}

export function assertType(
  typename: Tn,
  val: unknown,
  message?: string // eslint-disable-line comma-dangle
): asserts val is Tmap[Tn] {
  let isValid: boolean = false;

  switch(typename) {
    case "uint8": {
      isValid = (
        typeof val === "number" &&
        !Number.isNaN(val) &&
        Number.isFinite(val) &&
        Number.isInteger(val) &&
        val >= UINT8_RANGE[0] &&
        val <= UINT8_RANGE[1]
      );
    } break;

    case "uint16": {
      isValid = (
        typeof val === "number" &&
        !Number.isNaN(val) &&
        Number.isFinite(val) &&
        Number.isInteger(val) &&
        val >= UINT16_RANGE[0] &&
        val <= UINT16_RANGE[1]
      );
    } break;

    case "uint32": {
      isValid = (
        typeof val === "number" &&
        !Number.isNaN(val) &&
        Number.isFinite(val) &&
        Number.isInteger(val) &&
        val >= UINT32_RANGE[0] &&
        val <= UINT32_RANGE[1]
      );
    } break;

    case "func": {
      isValid = typeof val === "function";
    } break;
  }

  if(!isValid) {
    throw new BGDException(
      message?.trim() || `[@@assertType] Assertation failed for 'typeof ${typename}'`,
      "ER_ASSERTATION_FAILED" // eslint-disable-line comma-dangle
    );
  }
}
