"use client";

import { useEffect, useRef, useState } from "react";

import Stats from "stats.js";
import * as OBC from "@thatopen/components";

import api from "@/lib/api";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function Home() {
  const containerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Loading model...");

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
        world.scene.setup();
        world.scene.three.background = null; // optional

        world.renderer = new OBC.SimpleRenderer(components, containerRef.current);

        //world.camera = new OBC.OrthoPerspectiveCamera(components);
        world.camera = new OBC.SimpleCamera(components);
        //world.camera.controls.maxSpeed = 15;
        //world.camera.controls.
        await world.camera.controls.setLookAt(12, 6, 8, 0, 0, -10, false);
        world.camera.controls.minZoom = 0.1;
        
        // Disable damping to stop continuous movement after scroll stops
        world.camera.controls.dampingFactor = 0;

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

        world.camera.controls.addEventListener("rest", () =>
          fragmentsManager.core.update(true),
        );

        // Ensures that once the Fragments model is loaded
        // (converted from the IFC in this case),
        // it utilizes the world camera for updates
        // and is added to the scene.
        fragmentsManager.list.onItemSet.add(async ({ value: model }) => {
          model.useCamera(world.camera.three);
          world.scene.three.add(model.object);
          fragmentsManager.core.update(true);
          
          setLoadingMessage("Rendering model...");
          setIsLoading(false);
        });

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

    return () => {
      components.dispose();
      fragmentsManager.dispose();
      worlds.dispose();
      world.dispose();
    };
  }, []);

  async function loadIfc(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    setIsLoading(true);
    setLoadingMessage("Uploading and processing IFC file...");

    try {
      const formData = new FormData();
      formData.append("file", file);
    
      const response = await api.post("/fragments", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        }
      });
      console.log(response.data);
    
      setLoadingMessage("Loading fragments into viewer...");
    
      const buffer = Uint8Array.from(
        atob(response.data.fragments), 
        c => c.charCodeAt(0)
      ).buffer;

      fragmentsManager.core.load(buffer, { modelId: response.data.id });
    } catch (error) {
      console.error('Error loading fragments:', error);
      setIsLoading(false);
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
    
    if (!id.trim()) return;

    setIsLoading(true);
    setLoadingMessage(`Loading model: ${id}...`);

    try {
      const response = await api.get(`/fragments/${id}`);

      setLoadingMessage("Processing fragments...");

      const buffer = Uint8Array.from(
        atob(response.data.fragments), 
        c => c.charCodeAt(0)
      ).buffer;

      fragmentsManager.core.load(buffer, { modelId: id });
    } catch (error) {
      console.error('Error loading fragments by ID:', error);
      setIsLoading(false); // Hide spinner on error
    }
  }

  return (
    <>
      <LoadingSpinner isVisible={isLoading} message={loadingMessage} />
      
      <section className="flex justify-center items-center space-x-4 py-4 bg-gray-300">
        <div>
          <input type="file" 
                 accept=".ifc" 
                 onChange={loadIfc} 
                 id="file-input" 
                 className="hidden"
                 disabled={isLoading} />

          <label 
            htmlFor="file-input" 
            className={`cursor-pointer border border-gray-300 rounded-md p-2 ${
              isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-400 hover:bg-blue-500'
            } transition-colors`}
          >
            {isLoading ? 'Loading...' : 'Upload an IFC file'}
          </label>
        </div>

        <form onSubmit={loadById} className="flex items-center space-x-2">
          <label htmlFor="id" className="text-sm">
            ID:
          </label>

          <input type="text" 
                 id="id" 
                 name="id"
                 className="border border-black rounded-md p-2"
                 disabled={isLoading} />

          <button 
            type="submit" 
            disabled={isLoading}
            className={`border border-gray-300 rounded-md p-2 ${
              isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-400 hover:bg-green-500 cursor-pointer'
            } transition-colors`}
          >
            {isLoading ? 'Loading...' : 'Load'}
          </button>
        </form>
      </section>
      
      <main 
        ref={containerRef} 
        id="container" 
        className="flex-1"
      ></main>
    </>
  );
}
