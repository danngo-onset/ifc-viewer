"use client";

import { useEffect, useRef } from "react";

import { httpClient } from "@/api";

import { BimManager } from "@/lib/utils/bim";

import { LoadingSpinner } from "@/components/ui";
import { TopBar } from "@/components/ui/TopBar";
import { BottomToolbar } from "@/components/ui/BottomToolbar";

export default function Home() {
  const containerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const bimManager = BimManager.getInstance(container);

    const cleanupFunctions: Array<() => void> = [];

    (async () => {
      const initCleanup = await bimManager.init();

      const fragmentsManagerCleanup = await bimManager.initFragmentsManager();
      
      const [
        lengthMeasurementCleanup,
        areaMeasurementCleanup, 
        volumeMeasurementCleanup,
        //cameraDistanceLockCleanup,
        highlighterCleanup
      ] = await Promise.all([
        bimManager.initLengthMeasurer(),
        bimManager.initAreaMeasurer(),
        bimManager.initVolumeMeasurer(),
        //bimManager.initCameraOrbitLock(),
        bimManager.initHighlighter(),
        
        bimManager.initClipper(),
        bimManager.initViews()
      ]);
        
      if (initCleanup)                        cleanupFunctions.push(initCleanup);
      if (fragmentsManagerCleanup)            cleanupFunctions.push(fragmentsManagerCleanup);
      if (lengthMeasurementCleanup)           cleanupFunctions.push(lengthMeasurementCleanup);
      if (areaMeasurementCleanup)             cleanupFunctions.push(areaMeasurementCleanup);
      if (volumeMeasurementCleanup)           cleanupFunctions.push(volumeMeasurementCleanup);
      //if (cameraDistanceLockCleanup)          cleanupFunctions.push(cameraDistanceLockCleanup); 
      if (highlighterCleanup)                 cleanupFunctions.push(highlighterCleanup);

      cleanupFunctions.push(() => bimManager.dispose());
    })();

    return () => cleanupFunctions.forEach(cleanup => cleanup());
  }, []);

  useEffect(() => {
    (async () => await httpClient.get("/"))();
  }, []);

  return (
    <>
      <LoadingSpinner />
      
      <TopBar />
      
      <main 
        ref={containerRef} 
        id="container" 
        className="flex-1"
      ></main>

      <BottomToolbar />
    </>
  );
};
