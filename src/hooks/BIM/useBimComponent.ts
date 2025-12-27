import { useEffect, useState } from "react";

import { di } from "@/lib";

import type { BimComponent } from "@/domain/enums/BIM/BimComponent";

export function useBimComponent<T>(key: BimComponent) {
  const [component, setComponent] = useState<T | null>(null);

  useEffect(() => {
    // Poll until component is available in DI
    const interval = setInterval(() => {
      const instance = di.get<T>(key);
      if (instance) {
        setComponent(instance);
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [key]);

  return component;
};
