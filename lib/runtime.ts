
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


import { type IDisposable } from "./lifecycle";


export function immediate<TArgs extends unknown[]>(
  callback: (...args: TArgs) => void,
  ...args: TArgs // eslint-disable-line comma-dangle
): IDisposable & Disposable {
  const hasNativeMethod = typeof setImmediate === "function";
  const id = hasNativeMethod ? setImmediate(callback, ...args) : setTimeout(callback, 0, ...args);

  return {
    dispose() {
      if(hasNativeMethod) {
        clearImmediate(id as NodeJS.Immediate);
      } else {
        clearTimeout(id as NodeJS.Timeout);
      }
    },

    [Symbol.dispose]() {
      if(hasNativeMethod) {
        clearImmediate(id as NodeJS.Immediate);
      } else {
        clearTimeout(id as NodeJS.Timeout);
      }
    },
  };
}
