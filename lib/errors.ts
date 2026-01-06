
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


enum K_INTERNAL_BGD_ERRNO_MAP {
  ER_UNKNOWN = 2,
  ER_INVALID_ARGUMENT = 10,
  ER_RESOURCE_DISPOSED = 11,
  ER_NOT_IMPLEMENTED = 12,
  ER_ASSERTATION_FAILED = 13,
  ER_BUFFER_OVERFLOW = 14,
}

const recvErrno = new Set<number>([]);


export class BGDException extends Error {
  public static is(obj: unknown): obj is BGDException {
    return obj instanceof BGDException;
  }

  public override readonly name: string;
  public override readonly message: string;

  /** The context of error */
  public readonly context: unknown;

  /** The numeric error code */
  public readonly errno: number;

  public constructor(
    message?: string,
    errno: number | keyof typeof K_INTERNAL_BGD_ERRNO_MAP = "ER_UNKNOWN",
    contextData?: unknown // eslint-disable-line comma-dangle
  ) {
    super(message);

    this.name = "BGDException";
    this.context = contextData ?? null;

    if(typeof errno === "number") {
      this.errno = -Math.abs(errno);
    } else {
      if(!("ER_UNKNOWN" in K_INTERNAL_BGD_ERRNO_MAP)) {
        errno = "ER_UNKNOWN";
      }

      this.errno = K_INTERNAL_BGD_ERRNO_MAP[errno];
    }
  }

  public isRecoverable(): boolean {
    return this.errno < 0 ? false : recvErrno.has(this.errno);
  }

  public what(): string {
    return this.message || `An error was detected in somewhere of code (${this.errno})`;
  }
}
