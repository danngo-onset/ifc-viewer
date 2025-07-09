"use client";

import { useEffect, useRef } from "react";

import * as BUI from "@thatopen/ui";
import Stats from "stats.js";
import * as OBC from "@thatopen/components";

import api from "@/lib/api";
import { FragmentsGroup } from "@thatopen/fragments";

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

  useEffect(() => {
    async function init() {
      if (containerRef.current) {
        world.scene = new OBC.SimpleScene(components);
        world.renderer = new OBC.SimpleRenderer(components, containerRef.current);
        world.camera = new OBC.SimpleCamera(components);

        components.init();

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
      world.scene.dispose();
      world.camera.dispose();
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
    
      // Convert base64 fragments back to buffer
      const binaryString = atob(response.data.fragments);
      const buffer = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        buffer[i] = binaryString.charCodeAt(i);
      }
    
      // Use fragments manager to load the processed fragments, not the IFC loader
      const model: FragmentsGroup = fragmentsManager.load(buffer);
      
      // Add to scene
      world.scene.three.add(model);
      
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

  function download(file: File) {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(file);
    link.download = file.name;

    document.body.appendChild(link);
    link.click();
    link.remove();
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

        {/* <button
          onClick={exportFragments}
          className="cursor-pointer border border-gray-300 rounded-md p-2 bg-green-400"
        >
          Export Fragments
        </button> */}
      </section>
      
      <main 
        ref={containerRef} 
        id="container" 
        className="flex-1"
      >
      </main>
    </>
  );
}
