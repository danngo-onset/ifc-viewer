"use client";

import { useEffect, useRef, useState } from "react";

import { di } from "@/lib";

import { BimManager } from "@/lib/utils/BIM";

import { LoadingSpinner, TopBar, BottomToolbar } from "@/components/UI";

export default function Home() {
  const containerRef = useRef<HTMLElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Loading model...");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const bimUtilities = new BimManager(container);

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
        bimUtilities.initCameraOrbitLock()
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
      bimUtilities.dispose();
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

      <BottomToolbar />
    </>
  );
};
