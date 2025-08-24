import { fabric } from "fabric";

export interface PoolableObject {
  reset(): void;
  isInUse(): boolean;
  setInUse(inUse: boolean): void;
}

export class ObjectPool<T extends PoolableObject> {
  private pool: T[] = [];
  private createFn: () => T;
  private maxSize: number;

  constructor(
    createFn: () => T,
    initialSize: number = 5,
    maxSize: number = 50,
  ) {
    this.createFn = createFn;
    this.maxSize = maxSize;

    // Pre-populate pool
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.createFn());
    }
  }

  acquire(): T {
    // Find an unused object in the pool
    const obj = this.pool.find((item) => !item.isInUse());

    if (obj) {
      obj.setInUse(true);
      obj.reset();
      return obj;
    }

    // If no unused object found and pool isn't at max size, create new one
    if (this.pool.length < this.maxSize) {
      const newObj = this.createFn();
      newObj.setInUse(true);
      this.pool.push(newObj);
      return newObj;
    }

    // Pool is full, create temporary object (not pooled)
    console.warn("Object pool exhausted, creating temporary object");
    const tempObj = this.createFn();
    tempObj.setInUse(true);
    return tempObj;
  }

  release(obj: T): void {
    obj.setInUse(false);
    obj.reset();
  }

  clear(): void {
    this.pool.forEach((obj) => obj.setInUse(false));
  }

  getStats(): { total: number; inUse: number; available: number } {
    const inUse = this.pool.filter((obj) => obj.isInUse()).length;
    return {
      total: this.pool.length,
      inUse,
      available: this.pool.length - inUse,
    };
  }
}

// Poolable fabric object wrapper
export class PoolableFabricObject implements PoolableObject {
  private _inUse: boolean = false;
  public fabricObject: fabric.Object;

  constructor(fabricObject: fabric.Object) {
    this.fabricObject = fabricObject;
  }

  reset(): void {
    // Reset object properties to defaults
    this.fabricObject.set({
      left: 0,
      top: 0,
      angle: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
      visible: true,
    });
  }

  isInUse(): boolean {
    return this._inUse;
  }

  setInUse(inUse: boolean): void {
    this._inUse = inUse;
  }
}

// Pre-configured pools for common objects
export class FabricObjectPools {
  private static circlePool = new ObjectPool<PoolableFabricObject>(
    () => new PoolableFabricObject(new fabric.Circle({ radius: 15 })),
    10,
    100,
  );

  private static rectPool = new ObjectPool<PoolableFabricObject>(
    () => new PoolableFabricObject(new fabric.Rect({ width: 50, height: 50 })),
    10,
    100,
  );

  private static textPool = new ObjectPool<PoolableFabricObject>(
    () => new PoolableFabricObject(new fabric.Text("", { fontSize: 16 })),
    5,
    50,
  );

  static getCircle(): PoolableFabricObject {
    return this.circlePool.acquire();
  }

  static getRect(): PoolableFabricObject {
    return this.rectPool.acquire();
  }

  static getText(): PoolableFabricObject {
    return this.textPool.acquire();
  }

  static releaseCircle(obj: PoolableFabricObject): void {
    this.circlePool.release(obj);
  }

  static releaseRect(obj: PoolableFabricObject): void {
    this.rectPool.release(obj);
  }

  static releaseText(obj: PoolableFabricObject): void {
    this.textPool.release(obj);
  }

  static clearAll(): void {
    this.circlePool.clear();
    this.rectPool.clear();
    this.textPool.clear();
  }

  static getStats() {
    return {
      circles: this.circlePool.getStats(),
      rects: this.rectPool.getStats(),
      texts: this.textPool.getStats(),
    };
  }
}
