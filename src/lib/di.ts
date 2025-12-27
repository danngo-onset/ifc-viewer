import type { BimComponent } from "@/domain/enums/BIM/BimComponent";

class DIContainer {
  private static instance: DIContainer;
  private containers: Map<BimComponent, any> = new Map();

  static getInstance() {
    if (!this.instance) {
      this.instance = new DIContainer();
    }

    return this.instance;
  }

  register<T>(key: BimComponent, instance: T) {
    this.containers.set(key, instance);
  }

  /** Shouldn't be called directly in components, use useBimComponent hook instead */
  get<T>(key: BimComponent): T | null {
    return this.containers.get(key) || null;
  }

  dispose(key: BimComponent) {
    const instance = this.containers.get(key);
    if (instance && typeof instance.dispose === "function") {
      instance.dispose();
    }
    
    this.containers.delete(key);
  }

  disposeAll() {
    for (const key of this.containers.keys()) {
      this.dispose(key);
    }
    this.containers.clear();
  }
}

export const di = DIContainer.getInstance();
