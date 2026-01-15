
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


import { uuidv7 } from "uidlib";

import { INode } from "../def";
import type { Dict } from "../../types";


export interface IPersonProperties {
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  nickname: string | null;
  birthDate: Date | null;
}

export interface IPerson extends INode<IPersonProperties & Dict<unknown>> {
  readonly __brandName: "ad.person";
}


export class PersonNode implements IPerson, IPersonProperties {
  public readonly nodeId: string;
  private readonly _props: IPersonProperties & Dict<unknown>;

  public constructor(
    public readonly sequence: number,
    nid?: string | null,
    iprops?: Partial<IPersonProperties> // eslint-disable-line comma-dangle
  ) {
    this.nodeId = nid || uuidv7().replace(/-/g, "");

    this._props = {
      firstName: iprops?.firstName ?? null,
      middleName: iprops?.middleName ?? null,
      lastName: iprops?.lastName ?? null,
      nickname: iprops?.nickname ?? null,
      birthDate: iprops?.birthDate ?? null,
    };
  }

  public get __brandName() {
    return "ad.person" as const;
  }

  public get firstName(): string | null {
    return this._props.firstName;
  }

  public set firstName(val: string | null) {
    if(typeof val !== "string") {
      val = null;
    }

    this._props.firstName = val?.trim() || null;
  }

  public get middleName(): string | null {
    return this._props.middleName;
  }

  public set middleName(val: string | null) {
    if(typeof val !== "string") {
      val = null;
    }

    this._props.middleName = val?.trim() || null;
  }

  public get lastName(): string | null {
    return this._props.lastName;
  }

  public set lastName(val: string | null) {
    if(typeof val !== "string") {
      val = null;
    }

    this._props.lastName = val?.trim() || null;
  }

  public get nickname(): string | null {
    return this._props.nickname;
  }

  public set nickname(val: string | null) {
    if(typeof val !== "string") {
      val = null;
    }

    this._props.nickname = val?.trim() || null;
  }

  public get birthDate(): Date | null {
    return this._props.birthDate;
  }

  public set birthDate(val: Date | string | null) {
    if(!(val instanceof Date) || isNaN(val.getTime())) {
      if(typeof val !== "string") {
        val = null;
      } else {
        val = new Date(val);
      }
    }

    if(val && ( isNaN(val.getTime()) || val.getTime() > Date.now() )) {
      val = null;
    }

    this._props.birthDate = val ?? null;
  }

  public get properties() {
    return { ...this._props };
  }

  public toJSON(): object {
    return {
      type: "node",
      nodeId: this.nodeId,
      sequence: this.sequence,
      properties: {
        ...this._props,
        birthDate: this._props.birthDate?.toUTCString() ?? null,
      },
      __brandName: this.__brandName,
    };
  }
}
