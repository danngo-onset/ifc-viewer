class DIContainer {
  private static instance: DIContainer;
  private containers: Map<string, any> = new Map();

  static getInstance() {
    if (!this.instance) {
      this.instance = new DIContainer();
    }

    return this.instance;
  }

  register<T>(key: string, instance: T) {
    this.containers.set(key, instance);
  }

  /** Shouldn't be called directly in components, use useBimComponent hook instead */
  get<T>(key: string): T | null {
    return this.containers.get(key) || null;
  }

  dispose(key: string) {
    const instance = this.containers.get(key);
    if (instance && typeof instance.dispose === "function") {
      instance.dispose();
    }
    
    this.containers.delete(key);
  }

  disposeAll() {
    for (const [key] of this.containers) {
      this.dispose(key);
    }
    this.containers.clear();
  }
}

const di = DIContainer.getInstance();
export default di;
