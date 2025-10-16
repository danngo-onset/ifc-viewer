"use client";

import { useEffect, useRef, useState } from "react";

import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";

import * as THREE from "three";

import LoadingSpinner from "@/components/LoadingSpinner";
import TopBar from "@/components/TopBar";

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
  const fragmentsManagerRef = useRef<OBC.FragmentsManager | null>(components.get(OBC.FragmentsManager));
  const [fragmentsManagerState, setFragmentsManagerState] = useState<OBC.FragmentsManager | null>(null);
  const areaMeasurerRef = useRef<OBF.AreaMeasurement | null>(null);
  const [areaMeasurer, setAreaMeasurer] = useState<OBF.AreaMeasurement | null>(null);

  useEffect(() => {
    let keydownHandler: ((e: KeyboardEvent) => void) | null = null;
    let deleteKeyHandler: ((e: KeyboardEvent) => void) | null = null;
    
    async function init() {
      if (containerRef.current) {
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

        const areaMeasurerInstance = components.get(OBF.AreaMeasurement);
        areaMeasurerInstance.world = world;
        areaMeasurerInstance.color = new THREE.Color("#494CB6");
        areaMeasurerInstance.enabled = true;
        areaMeasurerInstance.mode = "square";
        areaMeasurerRef.current = areaMeasurerInstance;
        setAreaMeasurer(areaMeasurerInstance);

        components.init();

        const grids = components.get(OBC.Grids);
        grids.create(world);
      
        await initFragmentsManager();

        world.camera.controls.addEventListener("rest", () =>
          fragmentsManagerRef.current?.core.update(true),
        );

        // Ensures that once the Fragments model is loaded
        // (converted from the IFC in this case),
        // it utilizes the world camera for updates
        // and is added to the scene.
        fragmentsManagerRef.current?.list.onItemSet.add(async ({ value: model }) => {
          model.useCamera(world.camera.three);
          world.scene.three.add(model.object);
          fragmentsManagerRef.current?.core.update(true);
          
          setLoadingMessage("Rendering model...");
          setIsLoading(false);
        });

        world.onCameraChanged.add((camera) => {
          if (fragmentsManagerRef.current) {
            for (const [, model] of fragmentsManagerRef.current.list) {
              model.useCamera(camera.three);
            }
            fragmentsManagerRef.current.core.update(true);
          }
        });

        fragmentsManagerRef.current?.list.onItemSet.add(({ value: model }) => {
          model.useCamera(world.camera.three);
          world.scene.three.add(model.object);
          fragmentsManagerRef.current?.core.update(true);
        });

        keydownHandler = (e: KeyboardEvent) => {
          if (!(e.code === "Enter" || e.code === "NumpadEnter")) return;
          try {
            areaMeasurerRef.current?.endCreation();
          } catch (error) {
            console.error("Error ending measurement creation:", error);
          }
        };

        deleteKeyHandler = (e: KeyboardEvent) => {
          if (e.code === "Delete" || e.code === "Backspace") {
            try {
              if (areaMeasurerRef.current && areaMeasurerRef.current.list.size > 0) {
                areaMeasurerRef.current.delete();
              }
            } catch (error) {
              console.error("Error deleting measurement:", error);
            }
          }
        };
        
        if (containerRef.current && areaMeasurerRef.current) {
          (containerRef.current as HTMLElement).ondblclick = () => {
            try {
              areaMeasurerRef.current?.create();
            } catch (error) {
              console.error("Error creating measurement:", error);
            }
          };
          
          window.addEventListener("keydown", keydownHandler);
          window.onkeydown = deleteKeyHandler;
        }

        // Zoom into the dimension once it is added
        areaMeasurerRef.current?.list.onItemAdded.add((area) => {
          if (!area.boundingBox) return;

          const sphere = new THREE.Sphere();
          area.boundingBox.getBoundingSphere(sphere);
          world.camera.controls.fitToSphere(sphere, true);
        })
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
      fragmentsManagerRef.current?.dispose();
      areaMeasurerRef.current?.dispose();
      world.dispose();
    };
  }, []);

  async function initFragmentsManager() {
    const githubUrl = "https://thatopen.github.io/engine_fragment/resources/worker.mjs";
    const fetchedUrl = await fetch(githubUrl);
    const workerBlob = await fetchedUrl.blob();
    const workerFile = new File([workerBlob], "worker.mjs", {
      type: "text/javascript",
    });
    const workerUrl = URL.createObjectURL(workerFile);
    fragmentsManagerRef.current?.init(workerUrl);
    setFragmentsManagerState(fragmentsManagerRef.current);
  }

  return (
    <>
      <LoadingSpinner isVisible={isLoading} message={loadingMessage} />
      
      <TopBar 
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        setLoadingMessage={setLoadingMessage}
        initFragmentsManager={initFragmentsManager}
        fragmentsManager={fragmentsManagerState}
        areaMeasurer={areaMeasurer}
      />
      
      <main 
        ref={containerRef} 
        id="container" 
        className="flex-1"
      ></main>
    </>
  );
}
