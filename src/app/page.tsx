"use client";

import { useEffect, useRef, useState } from "react";

import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";

import di from "@/lib/di";
import BimExtentions from "@/lib/extensions/bim-extensions";

import LoadingSpinner from "@/components/LoadingSpinner";
import TopBar from "@/components/TopBar";

import Constants from "@/domain/Constants";

export default function Home() {
  const containerRef = useRef<HTMLElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Loading model...");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const components = new OBC.Components();
    const world = components.get(OBC.Worlds).create<
      OBC.SimpleScene,
      OBC.OrthoPerspectiveCamera,
      //OBC.SimpleRenderer
      OBF.PostproductionRenderer
    >();

    const cleanupFunctions: Array<() => void> = [];

    (async () => {
      await BimExtentions.initWorld(components, world, container);
      
      const [
        fragmentsManagerCleanup, 
        areaMeasurementCleanup, 
        lengthMeasurementCleanup
      ] = await Promise.all([
        BimExtentions.initFragmentsManager(components, world, setLoadingMessage, setIsLoading),
        BimExtentions.initAreaMeasurement(components, world, container),
        BimExtentions.initLengthMeasurement(components, world, container)
      ]);

      if (fragmentsManagerCleanup)  cleanupFunctions.push(fragmentsManagerCleanup);
      if (areaMeasurementCleanup)   cleanupFunctions.push(areaMeasurementCleanup);
      if (lengthMeasurementCleanup) cleanupFunctions.push(lengthMeasurementCleanup);
    })();

    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
      
      di.dispose(Constants.FragmentsManagerKey);
      di.dispose(Constants.AreaMeasurementKey);
      di.dispose(Constants.LengthMeasurementKey);
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
