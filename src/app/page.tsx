"use client";

import { useEffect, useRef, useState } from "react";

import Stats from "stats.js";
import * as OBC from "@thatopen/components";

import LoadingSpinner from "@/components/LoadingSpinner";
import TopBar from "@/components/TopBar";

export default function Home() {
  const containerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Loading model...");

  const components = new OBC.Components();
  const fragmentsManager = components.get(OBC.FragmentsManager);
  const world = components.get(OBC.Worlds).create<
    OBC.SimpleScene,
    OBC.OrthoPerspectiveCamera,
    OBC.SimpleRenderer
  >();

  useEffect(() => {
    async function init() {
      if (containerRef.current) {
        world.scene = new OBC.SimpleScene(components);
        world.scene.setup();
        world.scene.three.background = null; // light scene

        world.renderer = new OBC.SimpleRenderer(components, containerRef.current);

        world.camera = new OBC.OrthoPerspectiveCamera(components);
        world.camera.controls.maxDistance = 300;
        world.camera.controls.infinityDolly = false;
        await world.camera.controls.setLookAt(12, 6, 8, 0, 0, -10, false);
        
        // Disable damping to stop continuous movement after scroll stops
        //world.camera.controls.dampingFactor = 0;

        components.init();

        const grids = components.get(OBC.Grids);
        grids.create(world);
      
        const githubUrl = "https://thatopen.github.io/engine_fragment/resources/worker.mjs";
        const fetchedUrl = await fetch(githubUrl);
        const workerBlob = await fetchedUrl.blob();
        const workerFile = new File([workerBlob], "worker.mjs", {
          type: "text/javascript",
        });
        const workerUrl = URL.createObjectURL(workerFile);
        fragmentsManager.init(workerUrl);

        world.camera.controls.addEventListener("rest", () =>
          fragmentsManager.core.update(true),
        );

        // Ensures that once the Fragments model is loaded
        // (converted from the IFC in this case),
        // it utilizes the world camera for updates
        // and is added to the scene.
        fragmentsManager.list.onItemSet.add(async ({ value: model }) => {
          model.useCamera(world.camera.three);
          world.scene.three.add(model.object);
          fragmentsManager.core.update(true);
          
          setLoadingMessage("Rendering model...");
          setIsLoading(false);
        });

        // Initialise Stats.js for performance monitoring
        /* const stats = new Stats();
        stats.showPanel(2); // 0: fps, 1: ms, 2: mb
        document.body.append(stats.dom);
        stats.dom.style.left = "50px";
        stats.dom.style.top = "50px";
        stats.dom.style.zIndex = "1000";
        stats.dom.style.position = "absolute";
        world.renderer.onBeforeUpdate.add(() => stats.begin());
        world.renderer.onAfterUpdate.add(() => stats.end()); */
      }
    }

    init();

    return () => {
      components.dispose();
      fragmentsManager.dispose();
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
        fragmentsManager={fragmentsManager}
      />
      
      <main 
        ref={containerRef} 
        id="container" 
        className="flex-1"
      ></main>
    </>
  );
}
