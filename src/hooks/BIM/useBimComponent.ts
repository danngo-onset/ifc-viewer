import { useEffect, useState } from "react";

import { di } from "@/lib";

import type { BimComponent } from "@/domain/enums/BIM/BimComponent";

export function useBimComponent<K extends BimComponent>(key: K) {
  //const [component, setComponent] = useState<BimComponentTypeMap[K] | null>(null);
  const [component, setComponent] = useState<ReturnType<typeof di.get<K>>>(null);

  useEffect(() => {
    // Poll until component is available in DI
    const interval = setInterval(() => {
      const instance = di.get(key);
      if (instance) {
        setComponent(instance);
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [key]);

  return component;
};
