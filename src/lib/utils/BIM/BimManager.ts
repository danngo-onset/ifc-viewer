import * as OBC from "@thatopen/components";
import * as OBCF from "@thatopen/components-front";
import type { FragmentsModel, ItemData } from "@thatopen/fragments";

import * as THREE from "three";

import { di } from "@/lib";

import Constants from "@/domain/Constants";

import { BimComponent } from "@/domain/enums/BIM/BimComponent";

import type { SetState } from "@/domain/types/SetState";
import type { OrbitLockToggle } from "@/domain/types/OrbitLockToggle";
import type { World } from "@/domain/types/BIM/World";

export class BimManager {
  private readonly components : OBC.Components;
  private readonly world      : World;

  constructor(private readonly container: HTMLElement) {
    this.components = new OBC.Components();
    this.world = this.components.get(OBC.Worlds)
                                .create() as World;
    
    di.register(BimComponent.Components, this.components);
  }

  private orbitLockActive = false;
  private orbitLockMarker?: THREE.Mesh;

  async initWorld() {
    this.world.scene = new OBC.SimpleScene(this.components);
    this.world.scene.setup();
    this.world.scene.three.background = null; // light scene

    //world.renderer = new OBC.SimpleRenderer(components, containerRef.current);
    this.world.renderer = new OBCF.PostproductionRenderer(this.components, this.container as HTMLElement);

    this.world.camera = new OBC.OrthoPerspectiveCamera(this.components);
    //world.camera.controls.maxDistance = 300;
    //world.camera.controls.infinityDolly = false;
    await this.world.camera.controls.setLookAt(12, 6, 8, 0, 0, -10, false);
    
    // Disable damping to stop continuous movement after scroll stops
    //world.camera.controls.dampingFactor = 0;

    this.components.init();

    /* const grids = this.components.get(OBC.Grids);
    grids.create(this.world); */
  }

  async initFragmentsManager(
    setLoadingMessage: SetState<string>,
    setIsLoading: SetState<boolean>
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
      // resolve flickering issue with double-sided rendering (not working)
      model.tiles.onItemSet.add(({ value: mesh }) => {
        const materials = Array.isArray(mesh.material) ? mesh.material 
                                                       : [mesh.material];
        
        materials.forEach((mat) => {
          // Enable double-sided rendering for materials
          if ("side" in mat) {
            mat.side = THREE.DoubleSide;
          }
        });
      });

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

    di.register(BimComponent.FragmentsManager, fragmentsManager);

    return () => {
      URL.revokeObjectURL(workerUrl);
      this.world.camera.controls.removeEventListener("rest", cameraRestHandler);
      this.world.onCameraChanged.remove(cameraChangeHandler);
      fragmentsManager.list.onItemSet.remove(modelSetHandler);
    };
  }

  async initAreaMeasurer() {
    const measurer = this.components.get(OBCF.AreaMeasurement);
    measurer.world = this.world;
    measurer.color = new THREE.Color(Constants.Color.Measurer);
    measurer.enabled = true;
    measurer.mode = "square";

    const abortController = new AbortController();

    window.addEventListener(
      "keydown", 
      (e: KeyboardEvent) => {
        if (e.code !== "Enter" && e.code !== "NumpadEnter") return;
  
        try {
          measurer.endCreation();
        } catch (error) {
          console.error("Error ending measurement creation:", error);
        }
      }, 
      { signal: abortController.signal }
    );

    window.addEventListener(
      "keydown", 
      (e: KeyboardEvent) => {
        if (e.code !== "Delete" && e.code !== "Backspace") return;
  
        try {
          if (measurer.list.size > 0) {
            measurer.delete();
          }
        } catch (error) {
          console.error("Error deleting measurement:", error);
        }
      }, 
      { signal: abortController.signal }
    );

    this.container.addEventListener(
      "dblclick", 
      async () => await measurer.create(), 
      { signal: abortController.signal }
    );

    const zoomHandler = async (area: OBCF.Area) => {
      if (!area.boundingBox || !this.world.camera.controls) return;

      const sphere = new THREE.Sphere();
      area.boundingBox.getBoundingSphere(sphere);
      await this.world.camera.controls.fitToSphere(sphere, true);
    };
    measurer.list.onItemAdded.add(zoomHandler);

    di.register(BimComponent.AreaMeasurer, measurer);

    return () => {
      abortController.abort();
      measurer.list.onItemAdded.remove(zoomHandler);
    };
  }

  async initLengthMeasurer() {
    const measurer = this.components.get(OBCF.LengthMeasurement);
    measurer.world = this.world;
    measurer.color = new THREE.Color(Constants.Color.Measurer);
    measurer.enabled = false;
    measurer.mode = "free";

    const abortController = new AbortController();

    window.addEventListener(
      "keydown", 
      (event: KeyboardEvent) => {
        if (event.code !== "Delete" && event.code !== "Backspace") return;
  
        try {
          if (measurer.list.size > 0) {
            measurer.delete();
          }
        } catch (error) {
          console.error("Error deleting measurement:", error);
        }
      }, 
      { signal: abortController.signal }
    );

    this.container.addEventListener(
      "dblclick", 
      () => measurer.create(), 
      { signal: abortController.signal }
    );

    const zoomHandler = (line: OBCF.Line) => {
      if (!this.world.camera.controls) return;

      const center = new THREE.Vector3();
      line.getCenter(center);

      const radius = line.distance() / 3;
      const sphere = new THREE.Sphere(center, radius);
      this.world.camera.controls.fitToSphere(sphere, true);
    };
    measurer.list.onItemAdded.add(zoomHandler);

    di.register(BimComponent.LengthMeasurer, measurer);

    return () => {
      abortController.abort();
      measurer.list.onItemAdded.remove(zoomHandler);
    };
  }

  async initHighlighter() {
    const fragmentsManager = di.get<OBC.FragmentsManager>(BimComponent.FragmentsManager);
    if (!fragmentsManager) return;

    const world = this.world;
    this.components.get(OBC.Raycasters)
                   .get(world);
    
    const highlighter = this.components.get(OBCF.Highlighter);
    highlighter.setup({
      world,
      selectMaterialDefinition: {
        color: new THREE.Color(Constants.Color.Highlighter),
        opacity: 1,
        transparent: false,
        renderedFaces: 0
      }
    });
    highlighter.zoomToSelection = true;

    const highlightHandler = async (modelIdMap: OBC.ModelIdMap) => {
      const promises: Array<Promise<ItemData[]>> = [];
      for (const [modelId, localIds] of Object.entries(modelIdMap)) {
        const model = fragmentsManager.list.get(modelId);
        if (!model) continue;

        promises.push(model.getItemsData([...localIds]));
      }

      const data = (await Promise.all(promises)).flat();
      //console.log(data);
    };
    highlighter.events.select.onHighlight.add(highlightHandler);

    const clearHandler = () => {/* console.log("Selection was cleared") */};
    highlighter.events.select.onClear.add(clearHandler);

    //highlighter.enabled = false;
    di.register(BimComponent.Highlighter, highlighter);

    return () => {
      highlighter.events.select.onHighlight.remove(highlightHandler);
      highlighter.events.select.onClear.remove(clearHandler);
    };
  }

  /**
   * Initialise behaviour to set the orbit point to the clicked location when holding left mouse.
   * The camera will rotate around the picked point since orbit uses the current target.
   */
  initCameraOrbitLock() {
    const abortController = new AbortController();

    const onMouseDown = async (event: MouseEvent) => {
      if (event.button !== 0 || !this.orbitLockActive) return; // only left mouse button

      // Each raycaster is associated with a specific world.
      const raycaster = this.components.get(OBC.Raycasters)
                                       .get(this.world);

      const intersection = await raycaster.castRay();
      if (!intersection) return;

      const point = intersection.point;
      
      this.removeOrbitLockMarker();
      this.orbitLockMarker = this.createOrbitLockMarker(point);
      
      // Set the orbit target to the picked point, keep current camera position
      // camera-controls API exposed by OrthoPerspectiveCamera
      await this.world.camera.controls.setTarget(point.x, point.y, point.z, false);
      
      // Fallback: preserve position and update lookAt target
      /* const pos = this.world.camera.controls.getPosition(new THREE.Vector3());
      await this.world.camera.controls.setLookAt(pos.x, pos.y, pos.z, point.x, point.y, point.z, false); */
    };

    this.container.addEventListener("mousedown", onMouseDown, { passive: true, signal: abortController.signal });

    const orbitToggle: OrbitLockToggle = {
      enabled: this.orbitLockActive,
      setEnabled: (value: boolean) => {
        if (value) {
          if (!this.orbitLockActive) {
            this.container.addEventListener("mousedown", onMouseDown, { passive: true, signal: abortController.signal });
            this.orbitLockActive = true;
          }
        } else {
          if (this.orbitLockActive) {
            abortController.abort();
            this.orbitLockActive = false;
            this.removeOrbitLockMarker();
          }
        }
      }
    };
    di.register(BimComponent.OrbitLock, orbitToggle);

    return () => {
      abortController.abort();
      this.orbitLockActive = false;
      this.removeOrbitLockMarker();
    };
  }

  private createOrbitLockMarker(point: THREE.Vector3): THREE.Mesh { 
    const geometry = new THREE.CircleGeometry(0.5, 16);
    const material = new THREE.MeshBasicMaterial({ 
      color: Constants.Color.OrbitLock, 
      transparent: true, 
      opacity: 0.8,
      side: THREE.DoubleSide
    });
    
    const orbitLockMarker = new THREE.Mesh(geometry, material);
    orbitLockMarker.position.copy(point);
    
    // Orient the circle to face the camera
    const pos = this.world.camera.three.position;
    orbitLockMarker.lookAt(pos.x, pos.y, pos.z);
    
    this.world.scene.three.add(orbitLockMarker);

    return orbitLockMarker;
  }

  private removeOrbitLockMarker() {
    if (!this.orbitLockMarker) return;

    this.world.scene.three.remove(this.orbitLockMarker);
    this.orbitLockMarker.geometry.dispose();

    if (Array.isArray(this.orbitLockMarker.material)) {
      this.orbitLockMarker.material.forEach(m => m.dispose());
    } else {
      this.orbitLockMarker.material.dispose();
    }

    this.orbitLockMarker = undefined;
  }

  dispose() {
    this.components.dispose();
    this.world.dispose();
  }
}
