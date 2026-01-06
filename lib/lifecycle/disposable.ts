
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


export interface IDisposable {
  dispose(): void;
}


export class Disposable implements IDisposable {
  public static readonly None: IDisposable = Object.freeze({ dispose() {} });

  readonly #Lifecycle: Set<IDisposable> = new Set();
  #Disposed: boolean = false;

  public dispose(): void {
    if(!this.#Disposed) {
      this._clear();
      this.#Disposed = true;
    }
  }

  protected _clear(): void {
    this.#Lifecycle.forEach(item => item.dispose());
    this.#Lifecycle.clear();
  }

  protected _delete(o: IDisposable): boolean {
    if(this.#Disposed)
      return false;

    const r = this.#Lifecycle.delete(o);
    o.dispose();

    return r;
  }

  protected _deleteAndLeak(o: IDisposable): boolean {
    if(this.#Disposed)
      return false;

    return this.#Lifecycle.delete(o);
  }

  protected _register<T extends IDisposable>(o: T): T {
    if(this.#Disposed) {
      console.warn("[Disposable] Registering disposable on object that has already been disposed.");
      o.dispose();
    } else {
      this.#Lifecycle.add(o);
    }
      
    return o;
  }
}
