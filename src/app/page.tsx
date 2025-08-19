"use client";

import { useEffect, useRef, useState } from "react";

import Stats from "stats.js";
import * as OBC from "@thatopen/components";
import * as FRAGS from "@thatopen/fragments";

import * as THREE from "three";

import api from "@/lib/api";

export default function Home() {
  const containerRef = useRef<HTMLElement>(null);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [selectedItemName, setSelectedItemName] = useState<string>("");
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [formatPsets, setFormatPsets] = useState<boolean>(true);
  const [uniqueNames, setUniqueNames] = useState<boolean>(false);
  const [displayNames, setDisplayNames] = useState<boolean>(false);
  const [model, setModel] = useState<FRAGS.FragmentsModel | null>(null);
  const [localId, setLocalId] = useState<number | null>(null);
  const [isFragmentsManagerInitialized, setIsFragmentsManagerInitialized] = useState<boolean>(false);

  const components = new OBC.Components();
  const fragmentsManager = components.get(OBC.FragmentsManager);

  const worlds = components.get(OBC.Worlds);
  const world = worlds.create<
    OBC.SimpleScene,
    OBC.SimpleCamera,
    OBC.SimpleRenderer
  >();

  const highlightMaterial: FRAGS.MaterialDefinition = {
    color: new THREE.Color("gold"),
    renderedFaces: FRAGS.RenderedFaces.TWO,
    opacity: 1,
    transparent: false
  };
  

  useEffect(() => {
    async function init() {
      if (containerRef.current) {
        world.scene = new OBC.SimpleScene(components);
        world.scene.setup();
        world.scene.three.background = null; // optional

        world.renderer = new OBC.SimpleRenderer(components, containerRef.current);

        world.camera = new OBC.OrthoPerspectiveCamera(components);
        await world.camera.controls.setLookAt(12, 6, 8, 0, 0, -10);

        components.init();

        const grids = components.get(OBC.Grids);
        grids.create(world);
      
        const githubUrl = "https://thatopen.github.io/engine_fragment/resources/worker.mjs";
        const fetchedUrl = await fetch(githubUrl);
        const workerBlob = await fetchedUrl.blob();
        const workerFile = new File([workerBlob], "worker.mjs", {
          type: "text/javascript",
        });
        const workerUrl = URL.createObjectURL(workerFile);
        fragmentsManager.init(workerUrl);
        setIsFragmentsManagerInitialized(true);

        world.camera.controls.addEventListener("rest", () => {
          try {
            if (isFragmentsManagerInitialized) {
              fragmentsManager.core.update(true);
            }
          } catch (error) {
            console.warn("Error updating fragments manager on camera rest:", error);
          }
        });

        // Note: We're managing model setup manually in the load functions
        // to avoid conflicts with the automatic event listener

        // Initialise Stats.js for performance monitoring
        const stats = new Stats();
        stats.showPanel(2); // 0: fps, 1: ms, 2: mb
        document.body.append(stats.dom);
        stats.dom.style.left = "50px";
        stats.dom.style.top = "50px";
        stats.dom.style.zIndex = "1000";
        stats.dom.style.position = "absolute";
        world.renderer.onBeforeUpdate.add(() => stats.begin());
        world.renderer.onAfterUpdate.add(() => stats.end());

        // Add click event listener
        const mouse = new THREE.Vector2();
        containerRef.current.addEventListener("click", async (e: MouseEvent) => {
          mouse.x = e.clientX;
          mouse.y = e.clientY;

          const promises = [];
          promises.push(resetHighlight());

          const result = await model?.raycast({
            camera: world.camera.three,
            mouse,
            dom: world.renderer!.three.domElement
          });
          console.log("Raycast result:", result);
          if (result) {
            const newLocalId = result.localId;
            setLocalId(newLocalId);
            setSelectedItemId(newLocalId);
            console.log("Selected localId:", newLocalId);
            // Get the name of the selected item
            const itemName = await getName();
            setSelectedItemName(itemName || "");
            console.log("Selected item name:", itemName);
            onItemSelected();
            promises.push(highlight());
          } else {
            setLocalId(null);
            setSelectedItemId(null);
            setSelectedItemName("");
            onItemDeselected();
            console.log("No item selected");
          }

          try {
            if (isFragmentsManagerInitialized) {
              promises.push(fragmentsManager.core.update(true));
            }
          } catch (error) {
            console.warn("Error updating fragments manager on click:", error);
          }
          await Promise.all(promises);
        });
      }
    }

    init();

    return () => {
      // Clean up model if it exists
      if (model) {
        try {
          world.scene.three.remove(model.object);
          model.dispose();
          fragmentsManager.list.delete(model.modelId);
        } catch (error) {
          console.warn("Error during cleanup:", error);
        }
      }
      
      // Clean up meshes
      for (const mesh of meshes) {
        mesh.removeFromParent();
        mesh.geometry.dispose();
        const materials = Array.isArray(mesh.material)
          ? mesh.material
          : [mesh.material];
        for (const material of materials) {
          material.dispose();
        }
      }
      meshes = [];

      try {
        components.dispose();
        fragmentsManager.dispose();
        worlds.dispose();
        world.dispose();
        setIsFragmentsManagerInitialized(false);
      } catch (error) {
        console.warn("Error during final cleanup:", error);
      }
    };
  }, []);

  async function loadIfc(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    try {
      // Clear existing model first
      clearExistingModel();

      const formData = new FormData();
      formData.append("file", file);
    
      const response = await api.post("/fragments", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        }
      });
      console.log(response.data);
    
      const buffer = Uint8Array
        .from(
          atob(response.data.fragments), 
          c => c.charCodeAt(0)
        )
        .buffer;

      const loadedModel = await fragmentsManager.core.load(buffer, { modelId: response.data.id });
      setModel(loadedModel);
      
      // Setup the model manually since we bypassed the event listener
      loadedModel.useCamera(world.camera.three);
      world.scene.three.add(loadedModel.object);
      
      try {
        if (isFragmentsManagerInitialized) {
          await fragmentsManager.core.update(true);
        }
      } catch (error) {
        console.warn("Error updating fragments manager after loading:", error);
      }
      
      // Load categories when model is loaded
      console.log("Loading categories...");
      const modelCategories = await loadedModel.getCategories();
      console.log("Model categories:", modelCategories);
      setCategories(modelCategories);
    } catch (error) {
      console.error('Error loading fragments:', error);
    } finally {
      if (e.target) {
        e.target.value = "";
      }
    }
  }

  async function loadById(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const id = formData.get("id") as string;
    
    if (!id) {
      console.error("No ID provided");
      return;
    }

    console.log("Loading model by ID:", id);

    try {
      // Clear existing model first
      console.log("Clearing existing model...");
      await clearExistingModel();

      console.log("Fetching fragments from API...");
      const response = await api.get(`/fragments/${id}`);

      const buffer = Uint8Array.from(
        atob(response.data.fragments), 
        c => c.charCodeAt(0)
      ).buffer;

      console.log("Loading fragments into manager...");
      const loadedModel = await fragmentsManager.core.load(buffer, { modelId: id });
      setModel(loadedModel);
      console.log("Model loaded with ID:", loadedModel.modelId);
      
      // Setup the model manually since we bypassed the event listener
      loadedModel.useCamera(world.camera.three);
      world.scene.three.add(loadedModel.object);
      
      try {
        if (isFragmentsManagerInitialized) {
          await fragmentsManager.core.update(true);
        }
      } catch (error) {
        console.warn("Error updating fragments manager after loading:", error);
      }
      
      // Load categories when model is loaded
      console.log("Loading categories...");
      const modelCategories = await loadedModel.getCategories();
      console.log("Model categories:", modelCategories);
      setCategories(modelCategories);
      console.log("Model setup complete");
    } catch (error) {
      console.error('Error loading fragments by ID:', error);
    }
  }

  async function highlight() {
    if (!localId || !model) return;

    await model.highlight([localId], highlightMaterial);
  }

  async function resetHighlight() {
    if (!localId || !model) return;
    await model.resetHighlight();
  }

  const onItemSelected = () => {};
  const onItemDeselected = () => {};

  // Helper function to clear existing model
  const clearExistingModel = () => {
    if (model) {
      console.log("Clearing existing model with ID:", model.modelId);
      // Remove from scene
      world.scene.three.remove(model.object);
      
      // Try to dispose the model safely
      try {
        model.dispose();
      } catch (error) {
        console.warn("Error disposing model:", error);
      }
      
      setModel(null);
      setLocalId(null);
      setSelectedItemId(null);
      setSelectedItemName("");
      setCategories([]);
    }
    
    // Clear all models from fragments manager (without waiting for update)
    try {
      console.log("Clearing fragments manager list...");
      fragmentsManager.list.clear();
      console.log("Fragments manager list cleared");
    } catch (error) {
      console.warn("Error clearing fragments manager:", error);
    }
    
    console.log("Model cleanup completed");
  };

  // UI Handler Functions
  const onLogAttributes = async () => {
    console.log("Getting attributes for localId:", localId, "model:", !!model);
    if (!localId) {
      console.warn("No item selected (localId is null)");
      return;
    }
    if (!model) {
      console.warn("No model loaded");
      return;
    }
    const data = await getAttributes();
    console.log("Attributes data:", data);
  };

  const onLogPsets = async () => {
    console.log("Getting psets for localId:", localId, "model:", !!model);
    if (!localId) {
      console.warn("No item selected (localId is null)");
      return;
    }
    if (!model) {
      console.warn("No model loaded");
      return;
    }
    const data = await getItemPropertySets();
    console.log("Raw psets data:", data);
    if (!data) return;
    const result = formatPsets ? formatItemPsets(data) : data;
    console.log("Formatted psets:", result);
  };

  const onLogGeometry = async () => {
    const data = await getItemGeometry();
    if (!data) return;
    console.log(data);
  };

  const onNamesFromCategory = async () => {
    console.log("Getting names from category:", selectedCategory, "unique:", uniqueNames, "model:", !!model);
    if (!selectedCategory) {
      console.warn("No category selected");
      return;
    }
    if (!model) {
      console.warn("No model loaded");
      return;
    }
    const data = await getNamesFromCategory(selectedCategory, uniqueNames);
    console.log("Names from category:", data);
  };

  const onGeometriesFromCategory = async () => {
    if (!selectedCategory) return;
    const result = await getGeometriesFromCategory(selectedCategory);
    if (!result) return;
    
    const { localIds, geometries: data } = result;
    for (const value of data) {
      for (const meshData of value) {
        const mesh = createMesh(meshData);
        if (!mesh) continue;
        world.scene.three.add(mesh);
      }
    }
    await model?.setVisible(localIds, false);
    
    try {
      if (isFragmentsManagerInitialized) {
        await fragmentsManager.core.update(true);
      }
    } catch (error) {
      console.warn("Error updating fragments manager after geometry operation:", error);
    }
    console.log(data);
  };

  let meshes: THREE.Mesh[] = [];

  const onDisposeMeshes = async () => {
    for (const mesh of meshes) {
      mesh.removeFromParent();
      mesh.geometry.dispose();
      const materials = Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material];
      for (const material of materials) {
        material.dispose();
      }
    }
    meshes = [];
    
    try {
      await model?.setVisible(undefined, true);
    } catch (error) {
      console.warn("Error setting model visibility:", error);
    }
    
    try {
      if (isFragmentsManagerInitialized) {
        await fragmentsManager.core.update(true);
      }
    } catch (error) {
      console.warn("Error updating fragments manager:", error);
    }
  };

  const onLogStructure = async () => {
    const result = await getSpatialStructure();
    console.log(result);
  };

  const onLogLevelItems = async () => {
    const result = await getFirstLevelChildren();
    if (!result) return;
    
    if (displayNames) {
      const attrs = await model?.getItemsData(result, {
        attributesDefault: false,
        attributes: ["Name"],
      });
      const names = attrs?.map((data) => {
        if (!("Name" in data && "value" in data.Name)) return null;
        return data.Name.value;
      });
      console.log(names);
    } else {
      console.log(result);
    }
  };

  async function getAttributes(attributes?: string[]) {
    if (!localId || !model) return;

    // this model is the most straightforward way to get information
    // about 1 or multiple elements
    // options are available in the API reference
    const [data] = await model.getItemsData([localId], {
      attributesDefault: !attributes,
      attributes
    });

    return data;
  }

  async function getName() {
    const attributes = await getAttributes(["Name"]);
    const Name = attributes?.Name;

    if (!(Name && "value" in Name)) return null;

    return Name.value as "string";
  }

  // IsDefinedBy is the relationship that links property sets (psets) to the element they define
  // DefinesOccurrence is the relationship that links a property set to the elements that use it
  // In this case, we don't need to know the elements that have the psets (just the psets of the selected element)
  // then we don't want to get DefinesOccurrences items and that's by attributes and relations are set to false
  // refer to IFC schema documentation for more information
  async function getItemPropertySets() {
    if (!localId || !model) return;

    const [data] = await model.getItemsData([localId], {
      attributesDefault: false,
      attributes: ["Name", "NominalValue"],
      relations: {
        IsDefinedBy: { attributes: true, relations: true },
        DefinesOccurrence: { attributes: false, relations: false }
      }
    });

    return (data.IsDefinedBy as FRAGS.ItemData[]) ?? [];
  }

  function formatItemPsets(rawPsets: FRAGS.ItemData[]) {
    const result: Record<string, Record<string, any>> = {};

    for (const [_, pset] of rawPsets.entries()) {
      const { Name: psetName, HasProperties } = pset;

      if (!("value" in psetName && Array.isArray(HasProperties))) continue;

      const props: Record<string, any> = {};
      for (const [_, prop] of HasProperties.entries()) {
        const { Name, NominalValue } = prop;

        if (!("value" in Name && "value" in NominalValue)) continue;

        const name = Name.value;
        const nominalValue = NominalValue.value;

        if (!(name && nominalValue !== undefined)) continue;

        props[name] = nominalValue;
      }

      result[psetName.value] = props;
    }

    return result;
  }

  async function getNamesFromCategory(category: string, unique = false) {
    if (!model) return [];

    console.log("Getting items for category:", category);
    const categoryIds = await model.getItemsOfCategories([
      new RegExp(`^${category}`)
    ]);
    console.log("Category IDs result:", categoryIds);

    const localIds = categoryIds[category];
    console.log("Local IDs for category:", localIds);

    if (!localIds || localIds.length === 0) {
      console.warn("No items found for category:", category);
      return [];
    }

    const data = await model.getItemsData(localIds, {
      attributesDefault: false,
      attributes: ["Name"]
    });
    console.log("Items data:", data);

    const names = data
      .map(d => {
        const { Name } = d;
        
        if (!(Name && !Array.isArray(Name))) return null;

        return Name.value;
      })
      .filter(name => name) as string[];

    console.log("Extracted names:", names);
    return unique ? [...new Set(names)] : names;
  }

  async function getSpatialStructure() {
    if (!model) {
      console.warn("No model loaded for spatial structure");
      return;
    }

    console.log("Getting spatial structure...");
    const result = await model.getSpatialStructure();
    console.log("Spatial structure result:", result);
    return result;
  }

  async function getFirstLevelChildren() {
    if (!model) return null;

    const categoryIds = await model.getItemsOfCategories([/BUILDINGSTOREY/]);
    const localIds = categoryIds.IFCBUILDINGSTOREY;

    const attributes = await model.getItemsData(localIds, {
      attributesDefault: false,
      attributes: ["Name"]
    });

    let firstLevelLocalId = null;

    for (const [index, data] of attributes.entries()) {
      if (!("Name" in data && "value" in data.Name)) continue;

      if (data.Name.value === "01 - Entry Level") {
        firstLevelLocalId = localIds[index];
      }
    }

    if (firstLevelLocalId === null) return null;

    const children = await model.getItemsChildren([firstLevelLocalId]);
    return children;
  }

  async function getItemGeometry() {
    if (!localId || !model) return;

    const [geometryCollection] = await model.getItemsGeometry([localId]);
    return geometryCollection;
  }

  async function getGeometriesFromCategory(category: string) {
    if (!model) return;

    const items = await model.getItemsOfCategories([new RegExp(`^${category}$`)]);

    const localIds = Object.values(items).flat();
    const geometries = await model.getItemsGeometry(localIds);

    return { localIds, geometries };
  }

  const meshMaterial = new THREE.MeshLambertMaterial({ color: "purple" });

  function createMesh(data: FRAGS.MeshData) {
    const { positions, indices, normals, transform } = data;

    if (!(positions && indices && normals)) return null;

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
    geometry.setIndex(Array.from(indices));

    const mesh = new THREE.Mesh(geometry, meshMaterial);
    mesh.applyMatrix4(transform);
    meshes.push(mesh);

    return mesh;
  }

  return (
    <>
      <section className="flex justify-center items-center space-x-4 py-4 bg-gray-300">
        <div>
          <input type="file" 
                 accept=".ifc" 
                 onChange={loadIfc} 
                 id="file-input" 
                 className="hidden" />

          <label 
            htmlFor="file-input" 
            className="cursor-pointer border border-gray-300 rounded-md p-2 bg-blue-400"
          >
            Upload an IFC file
          </label>
        </div>

        <form onSubmit={loadById} className="flex items-center space-x-2">
          <label htmlFor="id" className="text-sm">
            ID:
          </label>

          <input type="text" 
                 id="id" 
                 name="id"
                 className="border border-black rounded-md p-2" />

          <button 
            type="submit" 
            className="cursor-pointer border border-gray-300 rounded-md p-2 bg-green-400"
          >
            Load
          </button>
        </form>
      </section>

      {/* Model Information Panel */}
      <div className="fixed right-4 top-4 w-80 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-[80vh] overflow-y-auto">
        <div className="bg-gray-100 p-3 border-b border-gray-300 rounded-t-lg">
          <h2 className="font-semibold text-lg">Model Information</h2>
        </div>
        
        <div className="p-4 space-y-4">
          {/* Info Section */}
          <div className="bg-blue-50 p-3 rounded-md">
            <p className="text-sm text-blue-800">
              💡 To better experience this tutorial, open your browser console to see the data logs.
            </p>
            <button
              onClick={() => {
                console.log("=== DEBUG INFO ===");
                console.log("Model:", !!model);
                console.log("Model ID:", model?.modelId);
                console.log("LocalId:", localId);
                console.log("Selected Item ID:", selectedItemId);
                console.log("Categories:", categories);
                console.log("Selected Category:", selectedCategory);
                console.log("Fragments Manager Initialized:", isFragmentsManagerInitialized);
              }}
              className="mt-2 px-2 py-1 bg-gray-200 text-gray-800 rounded text-xs"
            >
              Debug Info
            </button>
          </div>

          {/* Selected Item Section */}
          <div className="border border-gray-200 rounded-md p-3">
            <h3 className="font-medium mb-3">Selected Item</h3>
            
            {!selectedItemId ? (
              <p className="text-sm text-gray-600 mb-3">
                💡 Click any element in the viewer to activate the data log options.
              </p>
            ) : (
              <p className="text-sm font-medium mb-3 text-green-700">
                {selectedItemName || `Item ID: ${selectedItemId}`}
              </p>
            )}

            <div className="space-y-2">
              <button
                onClick={onLogAttributes}
                disabled={!selectedItemId}
                className="w-full px-3 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
              >
                Log Attributes
              </button>

              <div className="flex gap-2">
                <button
                  onClick={onLogPsets}
                  disabled={!selectedItemId}
                  className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
                >
                  Log Psets
                </button>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formatPsets}
                    onChange={(e) => setFormatPsets(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Format</span>
                </label>
              </div>

              <button
                onClick={onLogGeometry}
                disabled={!selectedItemId}
                className="w-full px-3 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
              >
                Log Geometry
              </button>
            </div>
          </div>

          {/* Categories Section */}
          <div className="border border-gray-200 rounded-md p-3">
            <h3 className="font-medium mb-3">Categories</h3>
            
            <div className="space-y-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <div className="flex gap-2">
                <button
                  onClick={onNamesFromCategory}
                  disabled={!selectedCategory}
                  className="flex-1 px-3 py-2 bg-green-500 text-white rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-green-600 transition-colors"
                >
                  Log Names
                </button>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={uniqueNames}
                    onChange={(e) => setUniqueNames(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Unique</span>
                </label>
              </div>

              <button
                onClick={onGeometriesFromCategory}
                disabled={!selectedCategory}
                className="w-full px-3 py-2 bg-green-500 text-white rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-green-600 transition-colors"
              >
                Log Geometries
              </button>

              <button
                onClick={onDisposeMeshes}
                className="w-full px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                Dispose Meshes
              </button>
            </div>
          </div>

          {/* Spatial Structure Section */}
          <div className="border border-gray-200 rounded-md p-3">
            <h3 className="font-medium mb-3">Spatial Structure</h3>
            
            <div className="space-y-2">
              <button
                onClick={onLogStructure}
                className="w-full px-3 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors"
              >
                Log Spatial Structure
              </button>

              <div className="flex gap-2">
                <button
                  onClick={onLogLevelItems}
                  className="flex-1 px-3 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors"
                >
                  Log First Level Items
                </button>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={displayNames}
                    onChange={(e) => setDisplayNames(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Names</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <main 
        ref={containerRef} 
        id="container" 
        className="flex-1"
      ></main>
    </>
  );
}
