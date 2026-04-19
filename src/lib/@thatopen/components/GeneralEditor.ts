import { Event, type World, type FragmentsManager } from "@thatopen/components";
import type { Element, FragmentsModel, RawMaterial } from "@thatopen/fragments";

import { Mesh, BoxGeometry } from "three";
import type { Group, MeshLambertMaterial, BufferGeometry } from "three";
import { TransformControls } from "three/examples/jsm/Addons.js";

export class GeneralEditor {
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
    get elementSelected() {
      return this._element !== null;
    }

    // Set up the basic elements and events in the constructor
    constructor(world: World, fragmentsManager: FragmentsManager) {
      this._world = world;
      this._fragmentsManager = fragmentsManager;
      this._gControls = new TransformControls(this._world.camera.three, this._world.renderer!.three.domElement); 
      this.setupEvents();
    }

    /** Initialise the editor and fetch all data necessary to build the UI */
    async init(model: FragmentsModel) {
      this._materials = await model.getMaterials();
      const [allLocalTransformIds, allGeometryIds] = await Promise.all([
        model.getLocalTransformsIds(),
        model.getRepresentationsIds()
      ]);

      this._localTransformIds = allLocalTransformIds.slice(0, 2);
      this._geometryIds = allGeometryIds.slice(0, 2);
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

      return Array.from(materialList.values());
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
    async applyChanges() {
      if (!this._element || !this._mesh)
        return;

      // Generates the requests to apply the changes to the selected mesh
      await this._element.setMeshes(this._mesh);

      // Apply the generated changes to fragmentsManager
      const requests = this._element.getRequests();
      if (requests) {
        await this._fragmentsManager.editor;
      }
    }
  }
