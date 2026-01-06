
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


export class Left<L, A> {
  public constructor(
    public readonly value: L // eslint-disable-line comma-dangle
  ) { }

  public isLeft(): this is Left<L, A> {
    return true;
  }

  public isRight(): this is Right<L, A> {
    return false;
  }
}

export class Right<L, A> {
  public constructor(
    public readonly value: A // eslint-disable-line comma-dangle
  ) { }

  public isLeft(): this is Left<L, A> {
    return false;
  }

  public isRight(): this is Right<L, A> {
    return true;
  }
}


export type Either<L, A> = Left<L, A> | Right<L, A>;


export const left = <L, A>(l: L): Either<L, A> => {
  return new Left<L, A>(l);
};

export const right = <L, A>(a: A): Either<L, A> => {
  return new Right<L, A>(a);
};
