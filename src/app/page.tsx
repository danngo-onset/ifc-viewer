"use client";

import { useEffect, useRef, useState } from "react";

import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";

import * as THREE from "three";

import di from "@/lib/di";

import LoadingSpinner from "@/components/LoadingSpinner";
import TopBar from "@/components/TopBar";

import Constants from "@/domain/Constants";

export default function Home() {
  const containerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Loading model...");

  const components = new OBC.Components();
  const world = components.get(OBC.Worlds).create<
    OBC.SimpleScene,
    OBC.OrthoPerspectiveCamera,
    //OBC.SimpleRenderer
    OBF.PostproductionRenderer
  >();

  let keydownHandler   : ((e: KeyboardEvent) => void) | null = null;
  let deleteKeyHandler : ((e: KeyboardEvent) => void) | null = null;

  useEffect(() => {
    async function init() {
      if (containerRef.current) {
        await Promise.all([
          initWorld(),
          initFragmentsManager(),
          initAreaMeasurement()
        ]);
      }
    }

    init();

    return () => {
      if (keydownHandler) {
        window.removeEventListener("keydown", keydownHandler);
      }

      window.onkeydown = null;
      
      if (containerRef.current) {
        (containerRef.current as HTMLElement).ondblclick = null;
      }
      
      components.dispose();
      di.dispose(Constants.FragmentsManagerKey);
      di.dispose(Constants.AreaMeasurementKey);
      world.dispose();
    };
  }, []);

  async function initWorld() {
    if (!containerRef.current) return;

    world.scene = new OBC.SimpleScene(components);
    world.scene.setup();
    world.scene.three.background = null; // light scene

    //world.renderer = new OBC.SimpleRenderer(components, containerRef.current);
    world.renderer = new OBF.PostproductionRenderer(components, containerRef.current);

    world.camera = new OBC.OrthoPerspectiveCamera(components);
    //world.camera.controls.maxDistance = 300;
    //world.camera.controls.infinityDolly = false;
    await world.camera.controls.setLookAt(12, 6, 8, 0, 0, -10, false);
    
    // Disable damping to stop continuous movement after scroll stops
    //world.camera.controls.dampingFactor = 0;

    components.init();

    const grids = components.get(OBC.Grids);
    grids.create(world);
  }

  async function initFragmentsManager() {
    const fragmentsManager = components.get(OBC.FragmentsManager);

    const githubUrl = "https://thatopen.github.io/engine_fragment/resources/worker.mjs";
    const fetchedUrl = await fetch(githubUrl);
    const workerBlob = await fetchedUrl.blob();
    const workerFile = new File([workerBlob], "worker.mjs", {
      type: "text/javascript",
    });
    const workerUrl = URL.createObjectURL(workerFile);

    fragmentsManager.init(workerUrl);

    world.camera.controls.addEventListener("rest", async () =>
      await fragmentsManager.core.update(true),
    );

    // Ensures that once the Fragments model is loaded
    // (converted from the IFC in this case),
    // it utilizes the world camera for updates
    // and is added to the scene.
    fragmentsManager.list.onItemSet.add(async ({ value: model }) => {
      model.useCamera(world.camera.three);
      world.scene.three.add(model.object);
      
      setLoadingMessage("Rendering model...");
      await fragmentsManager.core.update(true);
      setIsLoading(false);
    });

    world.onCameraChanged.add(async (camera) => {
      for (const [, model] of fragmentsManager.list) {
        model.useCamera(camera.three);
      }
      await fragmentsManager.core.update(true);
    });

    // Register after all handlers are set up
    di.register(Constants.FragmentsManagerKey, fragmentsManager);
  }

  async function initAreaMeasurement() {
    if (!containerRef.current) return;

    const areaMeasurer = components.get(OBF.AreaMeasurement);
    areaMeasurer.world = world;
    areaMeasurer.color = new THREE.Color("#494CB6");
    areaMeasurer.enabled = true;
    areaMeasurer.mode = "square";

    keydownHandler = (e: KeyboardEvent) => {
      if (!(e.code === "Enter" || e.code === "NumpadEnter")) return;
      try {
        areaMeasurer.endCreation();
      } catch (error) {
        console.error("Error ending measurement creation:", error);
      }
    };

    deleteKeyHandler = (e: KeyboardEvent) => {
      if (e.code === "Delete" || e.code === "Backspace") {
        try {
          if (areaMeasurer.list.size > 0) {
            areaMeasurer.delete();
          }
        } catch (error) {
          console.error("Error deleting measurement:", error);
        }
      }
    };
    
    (containerRef.current as HTMLElement).ondblclick = async () => {
      try {
        await areaMeasurer.create();
      } catch (error) {
        console.error("Error creating measurement:", error);
      }
    };
    
    window.addEventListener("keydown", keydownHandler);
    window.onkeydown = deleteKeyHandler;

    // Zoom into the dimension once it is added
    areaMeasurer.list.onItemAdded.add(async (area) => {
      if (!area.boundingBox) return;

      const sphere = new THREE.Sphere();
      area.boundingBox.getBoundingSphere(sphere);
      await world.camera.controls.fitToSphere(sphere, true);
    })

    // Register after all handlers are set up
    di.register(Constants.AreaMeasurementKey, areaMeasurer);
  }

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
