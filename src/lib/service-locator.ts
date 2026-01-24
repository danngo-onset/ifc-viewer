import type { BimComponent } from "@/domain/enums/BIM/BimComponent";
import type { IBimComponent } from "@/domain/interfaces/BIM";
import type { BimComponentTypeMap } from "@/domain/types/BIM";

class ServiceLocator {
  private container: Map<BimComponent, IBimComponent> = new Map();

  private static instance: ServiceLocator;

  static getInstance() {
    if (!this.instance) {
      this.instance = new this;
    }

    return this.instance;
  }

  register(key: BimComponent, instance: BimComponentTypeMap[BimComponent]) {
    this.container.set(key, instance);
  }

  /** Shouldn't be called directly in components, use useBimComponent hook instead */
  get<K extends BimComponent>(key: K): BimComponentTypeMap[K] | null {
    const instance = this.container.get(key);
    return (instance as BimComponentTypeMap[K] | undefined) || null;
  }

  dispose(key: BimComponent) {
    const instance = this.get(key);
    if (instance && typeof instance.dispose === "function") {
      instance.dispose();
    }
    
    this.container.delete(key);
  }

  disposeAll() {
    for (const key of this.container.keys()) {
      this.dispose(key);
    }
    this.container.clear();
  }
}

export const serviceLocator = ServiceLocator.getInstance();
