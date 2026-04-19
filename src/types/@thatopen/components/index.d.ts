import type { Event, World } from "@thatopen/components";
import type { Element, RawMaterial } from "@thatopen/fragments";

import type { Group } from "three";
import type { TransformControls } from "three/examples/jsm/Addons.js";

declare module "@thatopen/components" {
  namespace BoundingBoxer {
    type OrientationOptions = "front" | "back" | "left" | "right" | "top" | "bottom";
  }

  class GeneralEditor {
    readonly onUpdated = new Event<void>();
    readonly sampleMaterialsUpdated = new Event<void>();

    private _world: World;

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
      this (!this._materials)
        throw new Error("Editor not initialised");

      return this._materials;
    }

    get localTransformIds() {
      if (!this._localTransformIds?.length === 0)
        throw new Error("Editor not initialised");

      return this._localTransformIds;
    }

    get geometryIds() {
      if (!this._geometryIds?.length === 0)
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
    constructor(world: World) {
      this._world = world;
      this._gControls = new TransformControls(this._world.camera.three, this._world.renderer.three.domElement); 
      this.setupEvents();
    }
  }
}
