import { useCallback, useEffect, useReducer, useState } from "react";

import { serviceLocator } from "@/lib";

import type { BimComponent } from "@/domain/enums/bim/BimComponent";

type Resolved<TKey extends BimComponent> = NonNullable<
  ReturnType<typeof serviceLocator.resolve<TKey>>
>;

export function useBimComponent<TKey extends BimComponent>(key: TKey) {
  //const [component, setComponent] = useState<BimComponentTypeMap[K] | null>(null);
  const [component, setComponent] = useState<Resolved<TKey>>();

  const [, triggerRerender] = useReducer(x => x + 1, 0); 

  useEffect(() => {
    if (component) return;
      
    // Poll until component is available in container
    const interval = setInterval(() => {
      const instance = serviceLocator.resolve(key);
      if (instance) {
        setComponent(instance);
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [key, component]);

  const mutateComponent = useCallback(
    (mutate: (x: Resolved<TKey>) => void) => {
      if (!component) return false;

      mutate(component);
      triggerRerender();
      
      return true;
    }, 
    [component]
  );

  return [component, mutateComponent] as const;
};
