import * as OBC from "@thatopen/components";
import * as OBCF from "@thatopen/components-front";
import type { FragmentsModel, ItemData, BIMMaterial, BIMMesh } from "@thatopen/fragments";

import * as THREE from "three";

import { useUiStore } from "@/store";

import { serviceLocator } from "@/lib";
import { BimExtensions } from "@/lib/extensions/bim/bim-extensions";

import { Constants } from "@/domain/Constants";

import { BimComponent } from "@/domain/enums/bim/BimComponent";

import type { World } from "@/domain/types/bim/World";

import { CameraDistanceLocker } from ".";

export class BimManager {
  private readonly components : OBC.Components;
  private readonly world      : World;

  private readonly abortController : AbortController;

  private readonly uiStore = useUiStore.getState();

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

    this.abortController = new AbortController();
  }

  /**
   * Initialise the following core components:
   * - BUI, BUIC
   * - World
   * - Components
   */
  async init() {
    await BimExtensions.initBUI();

    this.world.scene = new OBC.ShadowedScene(this.components);

    this.world.renderer = new OBC.SimpleRenderer(this.components, this.container);
    //this.world.renderer = new OBCF.PostproductionRenderer(this.components, this.container);
    this.world.renderer.three.shadowMap.enabled = true;
    this.world.renderer.three.shadowMap.type = THREE.PCFSoftShadowMap;

    this.world.camera = new OBC.OrthoPerspectiveCamera(this.components);
    this.world.camera.three.far = 10000;
    //world.camera.controls.maxDistance = 300;
    //world.camera.controls.infinityDolly = false;


    const worldSetupConfig: Partial<OBC.ShadowedSceneConfig> = {
      shadows: {
        cascade: 1,
        resolution: 1024
      }
    };
    this.world.scene.setup(worldSetupConfig);
    this.world.scene.three.background = null; // light scene

    await this.world.camera.controls.setLookAt(12, 6, 8, 0, 0, -10, false);
    await this.world.scene.updateShadows();

    const cameraRestHandler = async () => await this.world.scene.updateShadows();
    this.world.camera.controls.addEventListener("rest", cameraRestHandler);
    
    // Disable damping to stop continuous movement after scroll stops
    //world.camera.controls.dampingFactor = 0;

    this.container.addEventListener(
      "resize", 
      () => {
        this.world.renderer?.resize();
        this.world.camera.updateAspect();
      },
      { signal: this.abortController.signal }
    );

    this.components.init();
    serviceLocator.register(BimComponent.Components, this.components);

    const grid = this.components.get(OBC.Grids)
                                .create(this.world);

    const cameraProjectionChangedHandler = () => {
      const projection: OBC.CameraProjection = this.world.camera.projection.current;
      grid.fade = projection === "Perspective";
    };
    this.world.camera.projection.onChanged.add(cameraProjectionChangedHandler);

    serviceLocator.register(BimComponent.World, this.world);

    return () => {
      this.world.camera.controls.removeEventListener("rest", cameraRestHandler);
      this.world.camera.projection.onChanged.remove(cameraProjectionChangedHandler);
    };
  }

  async initFragmentsManager() {
    const fragmentsManager = this.components.get(OBC.FragmentsManager);

    /* const githubUrl = "https://thatopen.github.io/engine_fragment/resources/worker.mjs";
    const fetchedUrl = await fetch(githubUrl);
    const workerBlob = await fetchedUrl.blob();
    const workerFile = new File([workerBlob], "worker.mjs", {
      type: "text/javascript",
    });
    const workerUrl = URL.createObjectURL(workerFile); */

    const worker = await fetch("/thatopen/worker.mjs");

    fragmentsManager.init(worker.url);

    const cameraRestHandler = async () => await fragmentsManager.core.update(true);
    this.world.camera.controls.addEventListener("rest", cameraRestHandler);

    
    const modelSetHandler = async ({ value: model }: { value: FragmentsModel }) => {
      model.useCamera(this.world.camera.three);
      this.world.scene.three.add(model.object);

      // TODO: need a global state to be signalled when a model is loaded

      // TODO: do we need to clean this up?
      model.tiles.onItemSet.add(({ value: mesh }: { value: BIMMesh }) => {
        if ("isMesh" in mesh) {
          const material = mesh.material as THREE.MeshStandardMaterial[];
          if (material[0].opacity === 1) {
            mesh.castShadow = true;
            mesh.receiveShadow = true;
          }
        }
      });
      
      this.uiStore.setLoadingMessage("Rendering model...");
      await fragmentsManager.core.update(true);
      this.uiStore.setIsLoading(false);
    };
    fragmentsManager.list.onItemSet.add(modelSetHandler);


    const zFightingHandler = ({ value: material }: { value: BIMMaterial }) => {
      if (!("isLodMaterial" in material && material.isLodMaterial)) {
        material.polygonOffset = true;
        material.polygonOffsetUnits = 1;
        material.polygonOffsetFactor = Math.random();
      }
    };
    fragmentsManager.core
                    .models
                    .materials
                    .list
                    .onItemSet
                    .add(zFightingHandler);


    const updateHandler = async () => await fragmentsManager.core.update(true);
    this.world.camera.controls.addEventListener("update", updateHandler);


    const cameraChangeHandler = async (camera: OBC.OrthoPerspectiveCamera) => {
      for (const model of fragmentsManager.list.values()) {
        model.useCamera(camera.three);
      }
      await updateHandler();
    };
    this.world.onCameraChanged.add(cameraChangeHandler);


    serviceLocator.register(BimComponent.FragmentsManager, fragmentsManager);

    return () => {
      //URL.revokeObjectURL(worker.url);
      this.world.camera.controls.removeEventListener("rest", cameraRestHandler);
      this.world.onCameraChanged.remove(cameraChangeHandler);
      this.world.camera.controls.removeEventListener("update", updateHandler);
      fragmentsManager.list.onItemSet.remove(modelSetHandler);
      fragmentsManager.core.models.materials.list.onItemSet.remove(zFightingHandler);
    };
  }

  async initLengthMeasurer() {
    const measurer = this.components.get(OBCF.LengthMeasurement);
    measurer.world = this.world;
    measurer.color = new THREE.Color(Constants.Color.Measurer);
    measurer.enabled = false;
    measurer.mode = "free";

    // TODO: do we need this?
    window.addEventListener(
      "keydown",
      e => {
        if (e.code !== "Enter" && e.code !== "NumpadEnter") return;

        measurer.endCreation();
      },
      { signal: this.abortController.signal }
    );

    // TODO: use right click or CTRL click
    window.addEventListener(
      "keydown", 
      e => {
        if (e.code !== "Delete" && e.code !== "Backspace") return;
  
        if (measurer.list.size > 0) {
          measurer.delete();
        }
      }, 
      { signal: this.abortController.signal }
    );

    this.container.addEventListener(
      "dblclick", 
      async () => await measurer.create(), 
      { signal: this.abortController.signal }
    );

    const zoomHandler = async (line: OBCF.Line) => {
      const center = new THREE.Vector3();
      line.getCenter(center);

      const radius = line.distance() / 3;
      const sphere = new THREE.Sphere(center, radius);

      await this.world.camera.controls.fitToSphere(sphere, true);
    };
    measurer.list.onItemAdded.add(zoomHandler);

    serviceLocator.register(BimComponent.LengthMeasurer, measurer);

    return () => {
      measurer.list.onItemAdded.remove(zoomHandler);
    };
  }

  async initAreaMeasurer() {
    const measurer = this.components.get(OBCF.AreaMeasurement);
    measurer.world = this.world;
    measurer.color = new THREE.Color(Constants.Color.Measurer);
    measurer.enabled = false;
    measurer.mode = "square";

    // TODO: do we need this?
    window.addEventListener(
      "keydown", 
      e => {
        if (e.code !== "Enter" && e.code !== "NumpadEnter") return;
        measurer.endCreation();
      }, 
      { signal: this.abortController.signal }
    );

    // TODO: use right click or CTRL click
    window.addEventListener(
      "keydown", 
      e => {
        if (e.code !== "Delete" && e.code !== "Backspace") return;
  
        if (measurer.list.size > 0) {
          measurer.delete();
        }
      }, 
      { signal: this.abortController.signal }
    );

    this.container.addEventListener(
      "dblclick", 
      async () => await measurer.create(), 
      { signal: this.abortController.signal }
    );

    const zoomHandler = async (area: OBCF.Area) => {
      if (!area.boundingBox || !this.world.camera.controls) return;

      const sphere = new THREE.Sphere();
      area.boundingBox.getBoundingSphere(sphere);
      await this.world.camera.controls.fitToSphere(sphere, true);
    };
    measurer.list.onItemAdded.add(zoomHandler);

    serviceLocator.register(BimComponent.AreaMeasurer, measurer);

    return () => {
      measurer.list.onItemAdded.remove(zoomHandler);
    };
  }

  async initVolumeMeasurer() {
    const measurer = this.components.get(OBCF.VolumeMeasurement);
    measurer.world = this.world;
    measurer.color = new THREE.Color(Constants.Color.Measurer);
    measurer.enabled = false;

    // TODO: do we need this?
    window.addEventListener(
      "keydown",
      e => {
        if (e.code !== "Enter" && e.code !== "NumpadEnter") return;

        measurer.endCreation();
      },
      { signal: this.abortController.signal }
    );

    // TODO: use right click or CTRL click
    window.addEventListener(
      "keydown",
      async e => {
        if (e.code !== "Delete" && e.code !== "Backspace") return;

        if (measurer.list.size > 0) {
          await measurer.delete();
        }
      },
      { signal: this.abortController.signal }
    );

    this.container.addEventListener(
      "dblclick",
      async () => {
        await measurer.create();

        setTimeout(() => measurer.endCreation(), 100);
      },
      { signal: this.abortController.signal }
    );

    const zoomHandler = async (volume: OBCF.Volume) => {
      const box = await volume.getBox();
      const sphere = new THREE.Sphere();

      box.getBoundingSphere(sphere);

      await this.world.camera.controls.fitToSphere(sphere, true);
    };
    measurer.list.onItemAdded.add(zoomHandler);

    serviceLocator.register(BimComponent.VolumeMeasurer, measurer);

    return () => {
      measurer.list.onItemAdded.remove(zoomHandler);
    };
  }

  /**
   * Initialise behaviour to set the orbit point to the clicked location when holding left mouse. \
   * The camera will rotate around the picked point since orbit uses the current target.
   */
  initCameraOrbitLock() {
    const cameraDistanceLocker = CameraDistanceLocker.getInstance(this.container, this.world);
    serviceLocator.register(BimComponent.CameraDistanceLocker, cameraDistanceLocker);

    return () => {
      cameraDistanceLocker.dispose();
    };
  }

  async initHighlighter() {
    const fragmentsManager = serviceLocator.resolve(BimComponent.FragmentsManager);
    if (!fragmentsManager) return;

    const world = this.world;
    this.components.get(OBC.Raycasters)
                   .get(world);
    
    const highlighter = this.components.get(OBCF.Highlighter);

    const config: Partial<OBCF.HighlighterConfig> = {
      world,
      selectMaterialDefinition: {
        color: new THREE.Color(Constants.Color.Highlighter),
        opacity: 1,
        transparent: false,
        renderedFaces: 0
      }
    };
    highlighter.setup(config);
    highlighter.zoomToSelection = true;
    highlighter.enabled = false;

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

    serviceLocator.register(BimComponent.Highlighter, highlighter);

    return () => {
      highlighter.events.select.onHighlight.remove(highlightHandler);
      highlighter.events.select.onClear.remove(clearHandler);
    };
  }

  initClipper() {
    // Init the Raycaster for the world to track mouse position for clipping planes
    /* const raycaster = this.components.get(OBC.Raycasters)
                                     .get(this.world); */

    const clipper = this.components.get(OBC.Clipper);
    clipper.enabled = false;

    this.container.addEventListener(
      "dblclick", 
      async () => {
        if (clipper.enabled) {
          await clipper.create(this.world);
        }
      }, 
      { signal: this.abortController.signal }
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
      { signal: this.abortController.signal, passive: false }
    );

    serviceLocator.register(BimComponent.Clipper, clipper);
  }

  async initViews() {
    const fragmentsManager = serviceLocator.resolve(BimComponent.FragmentsManager);
    if (!fragmentsManager) return;

    // The range defines how far the view will "see"
    // We can specify a default value, but it can be changed independently for each view instance after creation
    OBC.Views.defaultRange = 100;

    const views = this.components.get(OBC.Views);

    views.world = this.world;
    views.enabled = false;

    // Create views after a model is loaded (not at init time, when fragments.list is empty)
    const createViewsHandler = async () => {
      // we can specify which models the storeys will be taken from
      // in order to create the views
      // in this case, just the architectural model will be used
      const config: OBC.CreateViewFromIfcStoreysConfig = {
        modelIds: [/arq/]
      };
      await views.createFromIfcStoreys(config); // Assuming the fragments model comes from an IFC model. 
                                                // If the model uses a different schema than IFC, 
                                                // then the views have to be manually created based on its attributes.

      // TODO: Create views from cardinal directions by default, not working
      views.createElevations({ combine: true });
    };
    fragmentsManager.core.onModelLoaded.add(createViewsHandler);

    window.addEventListener(
      "dblclick",
      async () => {
        if (!views.enabled) return;

        const rayCaster = this.components.get(OBC.Raycasters)
                                         .get(this.world);

        const result = await rayCaster.castRay();
        if (!result) return;

        const { normal, point } = result;
        if (!(normal && point)) return;

        // The normal direction should be inverted so the view looks inside
        const invertedNormal = normal.clone().negate();
        const world = this.world;

        const view = views.create(
          invertedNormal,
          point.addScaledVector(normal, 1),
          {
            id: `View - ${views.list.size + 1}`,
            world
          }
        );

        // we can specify a different range from the default once the view is created
        view.range = 10;
        
        // displaying the helper is optional and is recommended only for debugging
        view.helpersVisible = true;
      },
      { signal: this.abortController.signal }
    );

    serviceLocator.register(BimComponent.Views, views);

    return () => {
      fragmentsManager.core.onModelLoaded.remove(createViewsHandler);
    };
  }

  dispose() {
    this.abortController.abort();
    serviceLocator.disposeAll();
    this.components.dispose();
    this.world.dispose();
  }
}
