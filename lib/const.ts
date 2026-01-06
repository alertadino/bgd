
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


export const GUID = "019B93F4-5172-704E-AA99-F234264EF6EE" as const;

export const INT8_RANGE = [ -128, 127 ] as const;
export const UINT8_RANGE = [ 0, 255 ] as const;

export const INT16_RANGE = [ -32768, 32767 ] as const;
export const UINT16_RANGE = [ 0, 65535 ] as const;

export const INT32_RANGE = [ -2147483648, 2147483647 ] as const;
export const UINT32_RANGE = [ 0, 4294967295 ] as const;

export const INT64_RANGE = [ -(2n ** 63n), (2n ** 63n) - 1n ] as const;
export const UINT64_RANGE = [ 0n, (2n ** 64n) - 1n ] as const;
