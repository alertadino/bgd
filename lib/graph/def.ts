
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


import type { Dict } from "../types";


export interface INode<P extends Dict<unknown> = Dict<unknown>> {
  readonly __brandName: string;
  readonly nodeId: string;
  readonly sequence: number;
  readonly properties: P;
}
