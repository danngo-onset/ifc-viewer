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
      model.setLocalProperties(propertiesData);
    }
      
    world.scene.three.add(model);

    await indexer.process(model);
    
    // The relations should already be processed and available
    // No need to serialize/deserialize - indexer.process() handles this

    const classifier = components.get(OBC.Classifier);
    
    await classifier.bySpatialStructure(model, {
      isolate: new Set([WEBIFC.IFCBUILDINGSTOREY]),
    });
    
    if (!classifier.list.spatialStructures) {
      // Try without isolation to see if basic classification works
      console.log("🔧 Trying basic classification without isolation...");
      await classifier.bySpatialStructure(model);
    } 
  }

  let isExploded = false;
  async function explodeModel() {
    console.log("Exploding model");
    try {
      const exploder = components.get(OBC.Exploder);

      isExploded = !isExploded;
      exploder.set(isExploded);
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
