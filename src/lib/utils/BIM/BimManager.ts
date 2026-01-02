import * as OBC from "@thatopen/components";
import * as OBCF from "@thatopen/components-front";
import type { FragmentsModel, ItemData } from "@thatopen/fragments";

import * as THREE from "three";

import { di } from "@/lib";

import { Constants } from "@/domain/Constants";

import { BimComponent } from "@/domain/enums/BIM/BimComponent";

import type { SetState } from "@/domain/types/SetState";
import type { World } from "@/domain/types/BIM/World";

import { CameraDistanceLocker } from ".";

export class BimManager {
  private readonly components : OBC.Components;
  private readonly world      : World;

  private static instance: BimManager;

  static getInstance(container: HTMLElement) {
    if (!this.instance) {
      this.instance = new this(container);
    }

    return this.instance;
  }

  private constructor(private readonly container: HTMLElement) {
    this.components = new OBC.Components();
    this.world = this.components.get(OBC.Worlds)
                                .create() as World;
  }

  private orbitLockActive = false;
  private orbitLockMarker?: THREE.Mesh;

  async initComponentsAndWorld() {
    this.world.scene = new OBC.SimpleScene(this.components);
    this.world.scene.setup();
    this.world.scene.three.background = null; // light scene

    //world.renderer = new OBC.SimpleRenderer(components, containerRef.current);
    this.world.renderer = new OBCF.PostproductionRenderer(
      this.components, 
      this.container, 
      { /* logarithmicDepthBuffer: true */ }
    );

    this.world.camera = new OBC.OrthoPerspectiveCamera(this.components);
    //world.camera.controls.maxDistance = 300;
    //world.camera.controls.infinityDolly = false;
    await this.world.camera.controls.setLookAt(12, 6, 8, 0, 0, -10, false);
    
    // Disable damping to stop continuous movement after scroll stops
    //world.camera.controls.dampingFactor = 0;

    this.components.init();
    di.register(BimComponent.Components, this.components);

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
   * Initialise behaviour to set the orbit point to the clicked location when holding left mouse. \
   * The camera will rotate around the picked point since orbit uses the current target.
   */
  initCameraOrbitLock() {
    const cameraDistanceLocker = CameraDistanceLocker.getInstance(this.container, this.world);
    di.register(BimComponent.CameraDistanceLocker, cameraDistanceLocker);

    return () => {
      cameraDistanceLocker.dispose();
    };
  }

  initClipper() {
    // Init the Raycaster for the world to track mouse position for clipping planes
    /* const raycaster = this.components.get(OBC.Raycasters)
                                     .get(this.world); */

    const clipper = this.components.get(OBC.Clipper);
    clipper.enabled = false;

    const abortController = new AbortController();

    this.container.addEventListener(
      "dblclick", 
      () => {
        if (clipper.enabled) {
          clipper.create(this.world);
        }
      }, 
      { signal: abortController.signal }
    );

    this.container.addEventListener(
      "mousedown",
      async e => {
        if (
          e.button !== 0
       || !e.ctrlKey
       || !clipper.enabled
       || clipper.list.size === 0
        ) {
          return;
        }
  
        e.preventDefault();
        e.stopPropagation();
  
        try {
          await clipper.delete(this.world);
        } catch (error) {
          console.log("No clipping plane found under cursor");
        }
      },
      { signal: abortController.signal, passive: false }
    );

    di.register(BimComponent.Clipper, clipper);

    return () => {
      abortController.abort();
    };
  }

  dispose() {
    di.disposeAll();
    this.components.dispose();
    this.world.dispose();
  }
}
