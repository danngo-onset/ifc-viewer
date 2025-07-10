"use client";

import { useEffect, useRef } from "react";

import * as BUI from "@thatopen/ui";
import Stats from "stats.js";
import * as OBC from "@thatopen/components";
import { FragmentsGroup } from "@thatopen/fragments";
import * as WEBIFC from "web-ifc";

import api from "@/lib/api";

export default function Home() {
  const containerRef = useRef(null);

  const components = new OBC.Components();

  const fragmentsManager = components.get(OBC.FragmentsManager);

  const worlds = components.get(OBC.Worlds);
  const world = worlds.create<
    OBC.SimpleScene,
    OBC.SimpleCamera,
    OBC.SimpleRenderer
  >();

  const indexer = components.get(OBC.IfcRelationsIndexer);

  useEffect(() => {
    async function init() {
      if (containerRef.current) {
        components.init();

        world.scene    = new OBC.SimpleScene(components);
        world.renderer = new OBC.SimpleRenderer(components, containerRef.current);
        world.camera   = new OBC.SimpleCamera(components);

        world.camera.controls.setLookAt(12, 6, 8, 0, 0, -10);

        world.scene.setup();

        const grids = components.get(OBC.Grids);
        grids.create(world);

        world.scene.three.background = null; // optional

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
      }
    }

    init();

    // Cleanup function that runs when component unmounts
    return () => {
      fragmentsManager.dispose();
      components.dispose();
      world.dispose();
    };
  }, []);

  async function loadIfc(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);
    
      const response = await api.post("/fragments", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        }
      });
      console.log(response.data);
    
      loadFragmentsIntoModel(response.data.fragments, response.data.properties);
      
      console.log(`✅ Loaded fragments with ${response.data.fragmentsCount} fragments`);
    } catch (error) {
      console.error('Error loading fragments:', error);
    } finally {
      // Clear the file input to allow selecting the same file again
      if (e.target) {
        e.target.value = "";
      }
    }
  }

  async function loadById(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const id = formData.get("id") as string;
    const response = await api.get(`/fragments/${id}`);

    loadFragmentsIntoModel(response.data.fragments, response.data.properties);
  }

  async function loadFragmentsIntoModel(fragments: string, properties?: string) {
    // Convert base64 fragments back to buffer
    const binaryString = atob(fragments);
    const buffer = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      buffer[i] = binaryString.charCodeAt(i);
    }
  
    const model: FragmentsGroup = fragmentsManager.load(buffer);
    
    // Set properties on the model if available
    if (properties) {
      const propertiesData = JSON.parse(properties);
      console.log("🔍 Properties structure preview:", {
        keys: Object.keys(propertiesData).slice(0, 5),
        totalItems: Object.keys(propertiesData).length,
        sampleProperty: propertiesData[Object.keys(propertiesData)[0]]
      });
      model.setLocalProperties(propertiesData);
    }
      
    world.scene.three.add(model);

    console.log("🔍 Model info before relations:");
    console.log("  - Model hasProperties:", !!model.hasProperties);
    console.log("  - Model items count:", model.items?.length || 0);
    console.log("  - Model data size:", model.data.size);

    console.log("🔧 Processing model relations...");
    await indexer.process(model);
    
    console.log("🔍 Relations after processing:");
    console.log("  - Indexer relationMaps keys:", Object.keys(indexer.relationMaps));
    
    // The relations should already be processed and available
    // No need to serialize/deserialize - indexer.process() handles this
    const modelKey = Object.keys(indexer.relationMaps)[0];
    const existingRelations = modelKey ? indexer.relationMaps[modelKey] : null;
    
    console.log("🔍 Direct relations access:");
    console.log("  - Model key:", modelKey);
    console.log("  - Relations exist:", !!existingRelations);
    console.log("  - Relations size:", existingRelations?.size || 0);
    
    if (existingRelations && existingRelations.size > 0) {
      console.log("✅ Relations already processed and available");
    } else {
      console.log("❌ No relations found after processing");
    }

    // Debug model data to see IFC categories
    console.log("🔍 IFC Categories in model:");
    const categoryCount = new Map<number, number>();
    for (const [expressID, data] of model.data) {
      const category = data[1][1];
      if (category !== undefined) {
        categoryCount.set(category, (categoryCount.get(category) || 0) + 1);
      }
    }
    console.log("  - IFCBUILDINGSTOREY (3124254112):", categoryCount.get(WEBIFC.IFCBUILDINGSTOREY) || 0);
    console.log("  - Categories found:", Array.from(categoryCount.entries()).slice(0, 5));

    const classifier = components.get(OBC.Classifier);
    
    console.log("🔧 Running spatial classification...");
    await classifier.bySpatialStructure(model, {
      isolate: new Set([WEBIFC.IFCBUILDINGSTOREY]),
    });
    
    console.log("🔍 Classification results:");
    console.log("  - Classifier list keys:", Object.keys(classifier.list));
    if (classifier.list.spatialStructures) {
      console.log("  - Spatial structures found:", Object.keys(classifier.list.spatialStructures));
    } else {
      console.log("  - ❌ No spatial structures created!");
      
      // Try without isolation to see if basic classification works
      console.log("🔧 Trying basic classification without isolation...");
      await classifier.bySpatialStructure(model);
      console.log("  - After basic classification:", Object.keys(classifier.list));
    }
  }

  async function explodeModel() {
    console.log("Exploding model");
    try {
      const exploder = components.get(OBC.Exploder);

      exploder.set(true);
    } catch (error) {
      console.error("Error exploding model:", error);
    }
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

        <button 
          onClick={explodeModel}
          className="cursor-pointer border border-gray-300 rounded-md p-2 bg-red-400"
        >
          Explode Model
        </button>
      </section>
      
      <main 
        ref={containerRef} 
        id="container" 
        className="flex-1"
      ></main>
    </>
  );
}
