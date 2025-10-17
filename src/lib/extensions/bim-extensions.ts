import { Dispatch, SetStateAction } from "react";

import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import { FragmentsModel } from "@thatopen/fragments";

import * as THREE from "three";

import di from "@/lib/di";

import Constants from "@/domain/Constants";

export default class BimExtensions {
  static async initWorld(
    components: OBC.Components, 
    world: OBC.SimpleWorld<
      OBC.SimpleScene, 
      OBC.OrthoPerspectiveCamera, 
      OBF.PostproductionRenderer
    >, 
    container: HTMLElement
  ) {
    world.scene = new OBC.SimpleScene(components);
    world.scene.setup();
    world.scene.three.background = null; // light scene

    //world.renderer = new OBC.SimpleRenderer(components, containerRef.current);
    world.renderer = new OBF.PostproductionRenderer(components, container as HTMLElement);

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

  static async initFragmentsManager(
    components: OBC.Components, 
    world: OBC.SimpleWorld<
      OBC.SimpleScene, 
      OBC.OrthoPerspectiveCamera, 
      OBF.PostproductionRenderer
    >, 
    setLoadingMessage: Dispatch<SetStateAction<string>>,
    setIsLoading: Dispatch<SetStateAction<boolean>>
  ) {
    const fragmentsManager = components.get(OBC.FragmentsManager);

    const githubUrl = "https://thatopen.github.io/engine_fragment/resources/worker.mjs";
    const fetchedUrl = await fetch(githubUrl);
    const workerBlob = await fetchedUrl.blob();
    const workerFile = new File([workerBlob], "worker.mjs", {
      type: "text/javascript",
    });
    const workerUrl = URL.createObjectURL(workerFile);

    fragmentsManager.init(workerUrl);

    const cameraRestHandler = async () => await fragmentsManager.core.update(true);
    world.camera.controls.addEventListener("rest", cameraRestHandler);

    const modelSetHandler = async ({ value: model }: { value: FragmentsModel }) => {
      model.useCamera(world.camera.three);
      world.scene.three.add(model.object);
      
      setLoadingMessage("Rendering model...");
      await fragmentsManager.core.update(true);
      setIsLoading(false);
    };
    fragmentsManager.list.onItemSet.add(modelSetHandler);

    const cameraChangeHandler = async (camera: OBC.OrthoPerspectiveCamera) => {
      for (const [, model] of fragmentsManager.list) {
        model.useCamera(camera.three);
      }
      await fragmentsManager.core.update(true);
    };
    world.onCameraChanged.add(cameraChangeHandler);

    di.register(Constants.FragmentsManagerKey, fragmentsManager);

    return () => {
      URL.revokeObjectURL(workerUrl);
      world.camera.controls.removeEventListener("rest", cameraRestHandler);
      world.onCameraChanged.remove(cameraChangeHandler);
      fragmentsManager.list.onItemSet.remove(modelSetHandler);
    };
  }

  static async initAreaMeasurement(
    components: OBC.Components, 
    world: OBC.World, 
    container: HTMLElement
  ) {
    const areaMeasurer = components.get(OBF.AreaMeasurement);
    areaMeasurer.world = world;
    areaMeasurer.color = new THREE.Color("#494CB6");
    areaMeasurer.enabled = true;
    areaMeasurer.mode = "square";

    const enterKeyHandler = (e: KeyboardEvent) => {
      if (!(e.code === "Enter" || e.code === "NumpadEnter")) return;
      try {
        areaMeasurer.endCreation();
      } catch (error) {
        console.error("Error ending measurement creation:", error);
      }
    };
    window.addEventListener("keydown", enterKeyHandler);

    const deleteKeyHandler = (e: KeyboardEvent) => {
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
    window.addEventListener("keydown", deleteKeyHandler);
    
    const dblclickHandler = async () => await areaMeasurer.create();
    if (container) container.addEventListener("dblclick", dblclickHandler);

    const zoomHandler = async (area: OBF.Area) => {
      if (!area.boundingBox || !world.camera.controls) return;

      const sphere = new THREE.Sphere();
      area.boundingBox.getBoundingSphere(sphere);
      await world.camera.controls.fitToSphere(sphere, true);
    };
    areaMeasurer.list.onItemAdded.add(zoomHandler);

    di.register(Constants.AreaMeasurementKey, areaMeasurer);

    return () => {
      window.removeEventListener("keydown", enterKeyHandler);
      window.removeEventListener("keydown", deleteKeyHandler);
      if (container) container.removeEventListener("dblclick", dblclickHandler);
      areaMeasurer.list.onItemAdded.remove(zoomHandler);
    };
  }

  static async initLengthMeasurement(
    components: OBC.Components, 
    world: OBC.World, 
    container: HTMLElement
  ) {
    const lengthMeasurer = components.get(OBF.LengthMeasurement);
    lengthMeasurer.world = world;
    lengthMeasurer.color = new THREE.Color("#494CB6");
    lengthMeasurer.enabled = false;

    const dblclickHandler = () => lengthMeasurer.create();
    if (container) container.addEventListener("dblclick", dblclickHandler);

    const keydownHandler = (event: KeyboardEvent) => {
      if ((event.code === "Delete" || event.code === "Backspace") 
       && lengthMeasurer.list.size > 0) {
        lengthMeasurer.delete();
      }
    };
    window.addEventListener("keydown", keydownHandler);

    const zoomHandler = (line: OBF.Line) => {
      if (!world.camera.controls) return;

      const center = new THREE.Vector3();
      line.getCenter(center);

      const radius = line.distance() / 3;
      const sphere = new THREE.Sphere(center, radius);
      world.camera.controls.fitToSphere(sphere, true);
    };
    lengthMeasurer.list.onItemAdded.add(zoomHandler);

    di.register(Constants.LengthMeasurementKey, lengthMeasurer);

    return () => {
      window.removeEventListener("keydown", keydownHandler);
      if (container) container.removeEventListener("dblclick", dblclickHandler);
      lengthMeasurer.list.onItemAdded.remove(zoomHandler);
    };
  }
}
