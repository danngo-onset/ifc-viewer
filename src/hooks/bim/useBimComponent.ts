import { useCallback, useEffect, useState } from "react";

import { serviceLocator } from "@/lib";

import type { BimComponent } from "@/domain/enums/bim/BimComponent";

type TValue<TKey extends BimComponent> = NonNullable<
  ReturnType<typeof serviceLocator.resolve<TKey>>
>;

export function useBimComponent<TKey extends BimComponent>(key: TKey) {
  //const [component, setComponent] = useState<BimComponentTypeMap[K] | null>(null);
  const [component, setComponent] = useState<TValue<TKey>>();

  // Used to trigger re-render
  const [, bump] = useState(0);

  useEffect(() => {
    // Poll until component is available in container
    const interval = setInterval(() => {
      const instance = serviceLocator.resolve(key);
      if (instance) {
        setComponent(instance);
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [key]);

  const mutateComponent = useCallback(
    (mutate: (x: TValue<TKey>) => void) => {
      if (!component) return false;

      mutate(component);
      bump(v => v + 1);
      
      return true;
    }, 
    [component]
  );

  return [component, mutateComponent] as const;
};
