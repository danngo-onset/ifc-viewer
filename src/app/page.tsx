"use client";

import { useEffect, useRef, useState } from "react";

import { BimManager } from "@/lib/utils/BIM";

import { LoadingSpinner, TopBar } from "@/components/UI";
import { BottomToolbar } from "@/components/UI/BottomToolbar";

export default function Home() {
  const containerRef = useRef<HTMLElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Loading model...");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const bimManager = BimManager.getInstance(container);

    const cleanupFunctions: Array<() => void> = [];

    (async () => {
      await bimManager.init();

      const fragmentsManagerCleanup = await bimManager.initFragmentsManager(setLoadingMessage, setIsLoading);
      
      const [
        lengthMeasurementCleanup,
        areaMeasurementCleanup, 
        volumeMeasurementCleanup,
        cameraDistanceLockCleanup,
        highlighterCleanup
      ] = await Promise.all([
        bimManager.initLengthMeasurer(),
        bimManager.initAreaMeasurer(),
        bimManager.initVolumeMeasurer(),
        bimManager.initCameraOrbitLock(),
        bimManager.initHighlighter(),
        
        bimManager.initClipper(),
        bimManager.initViews()
      ]);
        
      if (fragmentsManagerCleanup)            cleanupFunctions.push(fragmentsManagerCleanup);
      if (lengthMeasurementCleanup)           cleanupFunctions.push(lengthMeasurementCleanup);
      if (areaMeasurementCleanup)             cleanupFunctions.push(areaMeasurementCleanup);
      if (volumeMeasurementCleanup)           cleanupFunctions.push(volumeMeasurementCleanup);
      if (cameraDistanceLockCleanup)          cleanupFunctions.push(cameraDistanceLockCleanup); 
      if (highlighterCleanup)                 cleanupFunctions.push(highlighterCleanup);
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
