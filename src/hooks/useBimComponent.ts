import { useEffect, useState } from "react";

import di from "@/lib/di";

export default function useBimComponent<T>(key: string) {
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
}
