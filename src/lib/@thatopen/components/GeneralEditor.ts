import { Event, type World, type FragmentsManager } from "@thatopen/components";
import type { Element, FragmentsModel, RawMaterial, RawSample, RaycastResult } from "@thatopen/fragments";

import { Mesh, BoxGeometry, Vector2 } from "three";
import type { Group, MeshLambertMaterial, BufferGeometry, PerspectiveCamera, OrthographicCamera } from "three";
import { TransformControls } from "three/examples/jsm/Addons.js";

import type { IBimComponent } from "@/domain/interfaces/bim";

export class GeneralEditor implements IBimComponent {
    readonly onUpdated = new Event<void>();
    readonly sampleMaterialsUpdated = new Event<void>();

    private _world: World;
    private _fragmentsManager: FragmentsManager;

    private _element: Element = null;

    private _mesh: Group = null;

    // Global and local transform controls that will be used to edit the selected element
    private _gControls: TransformControls;
    private _lControls: TransformControls[] = [];

    private _controlType: "global" | "local" = "global";

    // Store a list of materials, local transform IDs  and geometry IDs
    // It'll be used to allow the user to change the material, local transform or geometry of a sample
    // The reason why we store the whole material and not only the ID is to display its colour in the select menu
    private _materials: Map<number, RawMaterial> = null;
    private _localTransformIds: number[] = [];
    private _geometryIds: number[] = [];

    // We need to get the materials, local transforms and geometries asynchronously, so we can't get them
    // in the constructor. We need to wait for the model to be initiaised first. So we will define getters 
    // that will throw an error if the model is not initialised yet

    get materials() {
      if (!this._materials)
        throw new Error("Editor not initialised");

      return this._materials;
    }

    get localTransformIds() {
      if (!this._localTransformIds)
        throw new Error("Editor not initialised");

      return this._localTransformIds;
    }

    get geometryIds() {
      if (!this._geometryIds)
        throw new Error("Editor not initialised");

      return this._geometryIds;
    }

    /**
     * A getter to expose the samples of the selected element,
     * which will be used for the UI to edit them
     */
    get samples() {
      if (!this._element)
        throw new Error("No element selected");

      return this._element.core.samples;
    }

    /** A getter to check if an element is currently selected */
    get elementSelected() : boolean {
      return this._element !== null;
    }

    // Set up the basic elements and events in the constructor
    constructor(world: World, fragmentsManager: FragmentsManager) {
      this._world = world;
      this._fragmentsManager = fragmentsManager;
      this._gControls = new TransformControls(this._world.camera.three, this._world.renderer.three.domElement); 
    }

    private readonly abortController = new AbortController();

    /** Initialise the editor and fetch all data necessary to build the UI */
    async init(model: FragmentsModel) {
      this._materials = await model.getMaterials();
      const [allLocalTransformIds, allGeometryIds] = await Promise.all([
        model.getLocalTransformsIds(),
        model.getRepresentationsIds()
      ]);

      this._localTransformIds = allLocalTransformIds.slice(0, 2);
      this._geometryIds = allGeometryIds.slice(0, 2);

      this.setupEvents(model);
      console.log("General editor initialised");
    }

    /** Return the list of Three js materials used by the currently selected element */
    get3dMaterials() {
      if (!this._mesh)
        return [];

      const materialList = new Map<string, MeshLambertMaterial>();

      this._mesh.traverse(obj => {
        if (obj instanceof Mesh) {
          materialList.set(
            obj.material.userData.localId,
            obj.material as MeshLambertMaterial
          );
        }
      });

      return materialList.values().toArray();
    }

    /** Allow changing the material of a sample */
    async setSampleMaterial(id: number, material: number) {
      if (!this._element)
        return;

      this._element.core.samples[id].material = material;
      
      await this.updateSamples();

      this.sampleMaterialsUpdated.trigger();
    }

    /** Update the materials list to update the UI material colour when a material was edited */
    async updateMaterials(model: FragmentsModel) {
      if (!this._materials)
        return;

      this._materials = await model.getMaterials();
    }

    /**
     * This method illustrates how to override the geometry of a sample
     * This is useful for building editors that rely on our geometry engine
     * (e.g, build something similar to Revit Wall System Family) 
    */
    overrideGeometryWithCube() {
      if (!this._mesh)
        return;

      this._mesh.traverse(obj => {
        if (obj instanceof Mesh) {
          const boxGeometry = new BoxGeometry(1, 1, 1);
          const geometry = obj.geometry as BufferGeometry;
          geometry.setAttribute("position", boxGeometry.attributes.position);
          geometry.setIndex(boxGeometry.index);
          geometry.setAttribute("normal", boxGeometry.attributes.normal);
        }
      });
    }

    /** Apply changes to the selected element then unselect it */
    async applyChanges(model: FragmentsModel) {
      if (!this._element || !this._mesh)
        return;

      // Generates the requests to apply the changes to the selected mesh
      await this._element.setMeshes(this._mesh);

      // Apply the generated changes to fragmentsManager
      const requests = this._element.getRequests();
      if (requests) {
        await this._fragmentsManager.core.editor.edit(model.modelId, requests);
      }

      // show hidden items if no changes were made
      if (!this._element.elementChanged) {
        await this.setVisible(true);
      }

      await this._fragmentsManager.core.update(true);

      this._element = null;
      this._mesh = null;

      this.onUpdated.trigger();
    }

    /** Set the mode of the global and local transform controls */
    setControlMode(mode: "translate" | "rotate") {
      this._gControls.setMode(mode);
      for (const lControl of this._lControls) {
        lControl.setMode(mode);
      }
    }

    /** Change between local and global transform controls */
    setControlsTarget(target = this._controlType) {
      const globalGizmo = this._gControls.getHelper();
      if (target === "global") {
        this._world.scene.three.add(globalGizmo);
        
        this._gControls.enabled = true;

        for (const lControl of this._lControls) {
          const localGizmo = lControl.getHelper();
          localGizmo.removeFromParent();
          lControl.enabled = false;
        }
      } else {
        globalGizmo.removeFromParent();
        this._gControls.enabled = false;
        for (const lControl of this._lControls) {
          const localGizmo = lControl.getHelper();
          this._world.scene.three.add(localGizmo);
          lControl.enabled = true;
        }
      }

      this._controlType = target;
    }

    /** 
     * Update the samples of the selected element
     * as well as regenerate the current mesh while maintaining the transform controls
     */
    async updateSamples() {
      if (!this._element || !this._mesh)
        return;

      const prevTransform = this._mesh.matrix.clone();
      
      await this._element.updateSamples();
      this.dispose();

      this._mesh = await this._element.getMeshes();
      this._world.scene.three.add(this._mesh);

      await this.createControls();

      this._mesh.position.set(0, 0, 0);
      this._mesh.rotation.set(0, 0, 0);
      this._mesh.applyMatrix4(prevTransform);
    }

    /** Unselect the current element and dispose the transform controls */
    dispose() {
      if (this._mesh && this._element) {
        this._element.disposeMeshes(this._mesh);
      }

      const globalGizmo = this._gControls.getHelper();
      globalGizmo.removeFromParent();
      this._gControls.detach();

      if (!this._mesh || !this._element)
        return;
      
      for (const lControl of this._lControls) {
        lControl.detach();
        lControl.dispose();
      }

      this._lControls.length = 0;

      this.abortController.abort();
    }

    /** Create the Three.js TransformControls for global and local transforms */
    private async createControls() {
      if (!this._mesh)
        return;

      this._gControls.attach(this._mesh);

      for (const localMesh of this._mesh.children) {
        const localTransformControl = new TransformControls(
          this._world.camera.three, 
          this._world.renderer.three.domElement
        );

        localTransformControl.attach(localMesh);
        localTransformControl.setMode(this._gControls.mode);

        this._lControls.push(localTransformControl);

        localTransformControl.addEventListener(
          "dragging-changed", 
          event => {
            if (this._world.camera.hasCameraControls()) {
              this._world.camera.controls.enabled = !event.value;
            }
          }
        );

        this.setControlsTarget();
      }
    }

    /** 
     * Set up the events for the global transform controls 
     * as well as the double click and keydown events
    */
    private setupEvents(model: FragmentsModel) {
      // Prevent camera moves when using the global transform controls
      this._gControls.addEventListener(
        "dragging-changed", 
        event => {
          if (this._world.camera.hasCameraControls()) {
            this._world.camera.controls.enabled = !event.value;
          }
        }
      );

      // Double click event logic to select an element
      const mouse = new Vector2();
      const canvas = this._world.renderer.three.domElement;
      canvas.addEventListener(
        "dblclick", 
        async event => {
          mouse.x = event.clientX;
          mouse.y = event.clientY;

          let result: RaycastResult;
          // raycast all models, including delta models
          for (const model of this._fragmentsManager.core.models.list.values()) {
            const promises: Promise<RaycastResult>[] = [];
            promises.push(
              model.raycast({
                camera: this._world.camera.three as PerspectiveCamera | OrthographicCamera,
                mouse,
                dom: this._world.renderer.three.domElement
              }),
            );

            const results = await Promise.all(promises);

            let smallDistance = Infinity;
            for (const cur of results) {
              if (cur && cur.distance < smallDistance) {
                smallDistance = cur.distance;
                result = cur;
              }
            }
          }

          if (!result)
            return;

          // if an element is already selected, reset the visibility
          if (this._element) {
            await this.setVisible(true);
          }

          const [element] = await this._fragmentsManager.core.editor.getElements(
            model.modelId, 
            [result.localId]
          );
          if (!element)
            return;
          
          this._element = element;

          if (this._mesh)
            this.dispose();

          // set the visibility of the selected elements to false in the original model
          await this.setVisible(false);

          // add the selected meshes to the scene and add the transform controls
          this._mesh = await element.getMeshes();
          this._world.scene.three.add(this._mesh);
          
          await this.createControls();

          await this._fragmentsManager.core.update(true);

          this.onUpdated.trigger();
        },
        { signal: this.abortController.signal }
      );

      window.addEventListener(
        "keydown",
        async event => {
          if (event.key === "Escape") {
            if (!this._element || !this._mesh)
              return;
            
            // Clear the existing edit requests
            this._element.getRequests();
            this.dispose();

            this.setVisible(true);

            await this._fragmentsManager.core.update(true);

            this._element = null;
            this._mesh = null;

            this.onUpdated.trigger();
          }
        },
        { signal: this.abortController.signal }
      );
    }

    /** 
     * Control the visibility of the existing/edited objects
     * When we use the edit API, fragments manager creates a new FragmentsModel called 
     * delta model that contains only the changed objects.
     * This is done to avoid having to recompute the whole model when only a few objects were changed
     * We then hide the edited objects in the original model
     * This method also manages the visibility both in the original and delta models
     * making sure the same element is not visible in both models at the same time
     */
    private async setVisible(visible: boolean) {
      if (!this._element)
        return;

      const promises: Promise<void>[] = [];
      for (const model of this._fragmentsManager.list.values()) {
        if (model.deltaModelId && visible) {
          const editedElements = new Set(await model.getEditedElements());
          if (editedElements.has(this._element.localId)) 
            continue;
        }

        promises.push(model.setVisible([this._element.localId], visible));
      }

      await Promise.all(promises);
    }
  }
