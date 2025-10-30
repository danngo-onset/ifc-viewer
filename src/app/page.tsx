"use client";

import { useEffect, useRef, useState } from "react";

import * as OBC from "@thatopen/components";

import di from "@/lib/di";
import BimUtilities from "@/lib/utils/bim-utils";

import LoadingSpinner from "@/components/LoadingSpinner";
import TopBar from "@/components/TopBar";

import type { WorldType } from "@/domain/types/WorldType";

export default function Home() {
  const containerRef = useRef<HTMLElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Loading model...");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const components = new OBC.Components();
    const world = components.get(OBC.Worlds)
                            .create() as WorldType;

    const bimUtilities = new BimUtilities(components, world, container);
    const cleanupFunctions: Array<() => void> = [];

    (async () => {
      await bimUtilities.initWorld();
      
      const [
        fragmentsManagerCleanup, 
        areaMeasurementCleanup, 
        lengthMeasurementCleanup,
        orbitLockCleanup
      ] = await Promise.all([
        bimUtilities.initFragmentsManager(setLoadingMessage, setIsLoading),
        bimUtilities.initAreaMeasurer(),
        bimUtilities.initLengthMeasurer(),
        bimUtilities.initOrbitLock()
      ]);

      const highlighterCleanup = await bimUtilities.initHighlighter();
        
      if (fragmentsManagerCleanup)  cleanupFunctions.push(fragmentsManagerCleanup);
      if (areaMeasurementCleanup)   cleanupFunctions.push(areaMeasurementCleanup);
      if (lengthMeasurementCleanup) cleanupFunctions.push(lengthMeasurementCleanup);
      if (orbitLockCleanup)         cleanupFunctions.push(orbitLockCleanup); 
      if (highlighterCleanup)       cleanupFunctions.push(highlighterCleanup);
    })();

    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
      
      di.disposeAll();
      components.dispose();
      world.dispose();
    };
  }, []);

  return (
    <>
      <LoadingSpinner isVisible={isLoading} message={loadingMessage} />
      
      <TopBar 
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        setLoadingMessage={setLoadingMessage}
      />
      
      <main 
        ref={containerRef} 
        id="container" 
        className="flex-1"
      ></main>
    </>
  );
};
