import { Dispatch, SetStateAction } from "react";

import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import { FragmentsModel } from "@thatopen/fragments";

import * as THREE from "three";

import di from "@/lib/di";

import Constants from "@/domain/Constants";
import { WorldType } from "@/domain/types/WorldType";

export default class BimUtilities {
  constructor(
    private readonly components : OBC.Components,
    private readonly world      : WorldType,
    private readonly container  : HTMLElement
  ) {}

  async initWorld() {
    this.world.scene = new OBC.SimpleScene(this.components);
    this.world.scene.setup();
    this.world.scene.three.background = null; // light scene

    //world.renderer = new OBC.SimpleRenderer(components, containerRef.current);
    this.world.renderer = new OBF.PostproductionRenderer(this.components, this.container as HTMLElement);

    this.world.camera = new OBC.OrthoPerspectiveCamera(this.components);
    //world.camera.controls.maxDistance = 300;
    //world.camera.controls.infinityDolly = false;
    await this.world.camera.controls.setLookAt(12, 6, 8, 0, 0, -10, false);
    
    // Disable damping to stop continuous movement after scroll stops
    //world.camera.controls.dampingFactor = 0;

    this.components.init();

    const grids = this.components.get(OBC.Grids);
    grids.create(this.world);
  }

  async initFragmentsManager(
    setLoadingMessage: Dispatch<SetStateAction<string>>,
    setIsLoading: Dispatch<SetStateAction<boolean>>
  ) {
    const fragmentsManager = this.components.get(OBC.FragmentsManager);

    const githubUrl = "https://thatopen.github.io/engine_fragment/resources/worker.mjs";
    const fetchedUrl = await fetch(githubUrl);
    const workerBlob = await fetchedUrl.blob();
    const workerFile = new File([workerBlob], "worker.mjs", {
      type: "text/javascript",
    });
    const workerUrl = URL.createObjectURL(workerFile);

    fragmentsManager.init(workerUrl);

    const cameraRestHandler = async () => await fragmentsManager.core.update(true);
    this.world.camera.controls.addEventListener("rest", cameraRestHandler);

    const modelSetHandler = async ({ value: model }: { value: FragmentsModel }) => {
      model.useCamera(this.world.camera.three);
      this.world.scene.three.add(model.object);
      
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
    this.world.onCameraChanged.add(cameraChangeHandler);

    di.register(Constants.FragmentsManagerKey, fragmentsManager);

    return () => {
      URL.revokeObjectURL(workerUrl);
      this.world.camera.controls.removeEventListener("rest", cameraRestHandler);
      this.world.onCameraChanged.remove(cameraChangeHandler);
      fragmentsManager.list.onItemSet.remove(modelSetHandler);
    };
  }

  async initAreaMeasurer() {
    const measurer = this.components.get(OBF.AreaMeasurement);
    measurer.world = this.world;
    measurer.color = new THREE.Color("#494CB6");
    measurer.enabled = true;
    measurer.mode = "square";

    const enterKeyHandler = (e: KeyboardEvent) => {
      if (!(e.code === "Enter" || e.code === "NumpadEnter")) return;
      try {
        measurer.endCreation();
      } catch (error) {
        console.error("Error ending measurement creation:", error);
      }
    };
    window.addEventListener("keydown", enterKeyHandler);

    const deleteKeyHandler = (e: KeyboardEvent) => {
      if (e.code === "Delete" || e.code === "Backspace") {
        try {
          if (measurer.list.size > 0) {
            measurer.delete();
          }
        } catch (error) {
          console.error("Error deleting measurement:", error);
        }
      }
    };
    window.addEventListener("keydown", deleteKeyHandler);
    
    const dblclickHandler = async () => await measurer.create();
    if (this.container) this.container.addEventListener("dblclick", dblclickHandler);

    const zoomHandler = async (area: OBF.Area) => {
      if (!area.boundingBox || !this.world.camera.controls) return;

      const sphere = new THREE.Sphere();
      area.boundingBox.getBoundingSphere(sphere);
      await this.world.camera.controls.fitToSphere(sphere, true);
    };
    measurer.list.onItemAdded.add(zoomHandler);

    di.register(Constants.AreaMeasurementKey, measurer);

    return () => {
      window.removeEventListener("keydown", enterKeyHandler);
      window.removeEventListener("keydown", deleteKeyHandler);
      if (this.container) this.container.removeEventListener("dblclick", dblclickHandler);
      measurer.list.onItemAdded.remove(zoomHandler);
    };
  }

  async initLengthMeasurer() {
    const measurer = this.components.get(OBF.LengthMeasurement);
    measurer.world = this.world;
    measurer.color = new THREE.Color("#494CB6");
    measurer.enabled = false;
    measurer.mode = "free";

    const dblclickHandler = () => measurer.create();
    if (this.container) this.container.addEventListener("dblclick", dblclickHandler);

    const keydownHandler = (event: KeyboardEvent) => {
      if ((event.code === "Delete" || event.code === "Backspace") 
       && measurer.list.size > 0) {
        measurer.delete();
      }
    };
    window.addEventListener("keydown", keydownHandler);

    const zoomHandler = (line: OBF.Line) => {
      if (!this.world.camera.controls) return;

      const center = new THREE.Vector3();
      line.getCenter(center);

      const radius = line.distance() / 3;
      const sphere = new THREE.Sphere(center, radius);
      this.world.camera.controls.fitToSphere(sphere, true);
    };
    measurer.list.onItemAdded.add(zoomHandler);

    di.register(Constants.LengthMeasurementKey, measurer);

    return () => {
      window.removeEventListener("keydown", keydownHandler);
      if (this.container) this.container.removeEventListener("dblclick", dblclickHandler);
      measurer.list.onItemAdded.remove(zoomHandler);
    };
  }
}
