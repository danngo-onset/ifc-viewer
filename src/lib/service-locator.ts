import type { BimComponent } from "@/domain/enums/bim/BimComponent";
import type { IBimComponent } from "@/domain/interfaces/bim";
import type { BimComponentTypeMap } from "@/domain/types/bim";

// TODO: Check whether this can be refactored following this https://blog.ploeh.dk/2010/02/03/ServiceLocatorisanAnti-Pattern/#c74efcff64084de68a0cc3ee0a9a21e5
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
  resolve<K extends BimComponent>(key: K): BimComponentTypeMap[K] | null {
    const instance = this.container.get(key);
    return (instance as BimComponentTypeMap[K] | undefined) || null;
  }

  dispose(key: BimComponent) {
    const instance = this.resolve(key);
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
