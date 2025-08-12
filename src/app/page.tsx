"use client";

import { useEffect, useRef } from "react";

import Stats from "stats.js";
import * as OBC from "@thatopen/components";

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

        world.camera.controls.addEventListener("rest", () =>
          fragmentsManager.core.update(true),
        );

        // Ensures that once the Fragments model is loaded
        // (converted from the IFC in this case),
        // it utilizes the world camera for updates
        // and is added to the scene.
        fragmentsManager.list.onItemSet.add(({ value: model }) => {
          model.useCamera(world.camera.three);
          world.scene.three.add(model.object);
          fragmentsManager.core.update(true);
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

    try {
      const formData = new FormData();
      formData.append("file", file);
    
      const response = await api.post("/fragments", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        }
      });
      console.log(response.data);
    
      const buffer = Uint8Array.from(
        atob(response.data.fragments), 
        c => c.charCodeAt(0)
      ).buffer;

      fragmentsManager.core.load(buffer, { modelId: response.data.id });
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
    const response = await api.get(`/fragments/${id}`);

    const buffer = Uint8Array.from(
      atob(response.data.fragments), 
      c => c.charCodeAt(0)
    ).buffer;

    fragmentsManager.core.load(buffer, { modelId: id });
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
      
      <main 
        ref={containerRef} 
        id="container" 
        className="flex-1"
      ></main>
    </>
  );
}
