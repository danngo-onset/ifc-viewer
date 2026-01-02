"use client";

import { useEffect, useRef, useState } from "react";

import { BimManager } from "@/lib/utils/BIM";

import { LoadingSpinner, TopBar, BottomToolbar } from "@/components/UI";

export default function Home() {
  const containerRef = useRef<HTMLElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Loading model...");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const bimManager = new BimManager(container);

    const cleanupFunctions: Array<() => void> = [];

    (async () => {
      await bimManager.initComponentsAndWorld();
      
      const [
        fragmentsManagerCleanup, 
        areaMeasurementCleanup, 
        lengthMeasurementCleanup,
        orbitLockCleanup
      ] = await Promise.all([
        bimManager.initFragmentsManager(setLoadingMessage, setIsLoading),
        bimManager.initAreaMeasurer(),
        bimManager.initLengthMeasurer(),
        bimManager.initCameraOrbitLock()
      ]);

      const highlighterCleanup = await bimManager.initHighlighter();
        
      if (fragmentsManagerCleanup)  cleanupFunctions.push(fragmentsManagerCleanup);
      if (areaMeasurementCleanup)   cleanupFunctions.push(areaMeasurementCleanup);
      if (lengthMeasurementCleanup) cleanupFunctions.push(lengthMeasurementCleanup);
      if (orbitLockCleanup)         cleanupFunctions.push(orbitLockCleanup); 
      if (highlighterCleanup)       cleanupFunctions.push(highlighterCleanup);
    })();

    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
      
      bimManager.dispose();
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
