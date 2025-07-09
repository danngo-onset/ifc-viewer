"use client";

import { useEffect, useRef } from "react";

import * as WEBIFC from "web-ifc";
import * as BUI from "@thatopen/ui";
import Stats from "stats.js";
import * as OBC from "@thatopen/components";

export default function Home() {
  const containerRef = useRef(null);

  const components = new OBC.Components();
  const fragmentIfcLoader = components.get(OBC.IfcLoader);
  const worlds = components.get(OBC.Worlds);
  const world = worlds.create<
    OBC.SimpleScene,
    OBC.SimpleCamera,
    OBC.SimpleRenderer
  >();
  const fragments = components.get(OBC.FragmentsManager);

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

        
        fragments.onFragmentsLoaded.add((model) => {
          console.log(model);
        });

        // Set WASM file location
        fragmentIfcLoader.settings.wasm = {
          path: "/web-ifc.wasm",
          absolute: false
        };

        await fragmentIfcLoader.setup();

        // optionally exclude categories that we don't want to convert to fragments
        const excludedCats = [
          WEBIFC.IFCTENDONANCHOR,
          WEBIFC.IFCREINFORCINGBAR,
          WEBIFC.IFCREINFORCINGELEMENT
        ];
        for (const cat of excludedCats) {
          fragmentIfcLoader.settings.excludedCategories.add(cat);
        }

        fragmentIfcLoader.settings.webIfc.COORDINATE_TO_ORIGIN = true;

        // Try to load existing fragments from IndexedDB
        const dbRequest = indexedDB.open("FragmentsDB", 1);
        
        dbRequest.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains("fragments")) {
            db.createObjectStore("fragments", { keyPath: "id" });
          }
        };
        
        dbRequest.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          const transaction = db.transaction(["fragments"], "readonly");
          const store = transaction.objectStore("fragments");
          const request = store.get("model_fragments");
          
          request.onsuccess = (event) => {
            const result = (event.target as IDBRequest).result;
            if (result && result.data) {
              const fragmentData = result.data; // Your Uint8Array
              // Load fragments back into the viewer
              const model = fragments.load(fragmentData);
              world.scene.three.add(model);
              console.log("Fragments loaded from IndexedDB");
            }
          };
        };
      }
    }

    init();

    // Cleanup function that runs when component unmounts
    return () => {
      fragments.dispose();
      
      // Also dispose of other components if needed
      components.dispose();
    };
  }, []);

  async function loadIfc(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const buffer = new Uint8Array(data);
      const model = await fragmentIfcLoader.load(buffer);

      model.setProperties(1, { name: "example" });

      world.scene.three.add(model);

      await exportFragments();
    } catch (error) {
      console.error('Error loading IFC file:', error);
      // You might want to show this error to the user in a more friendly way
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

  async function exportFragments() {
    if (!fragments.groups.size) return;

    const group = Array.from(fragments.groups.values())[0];
    const data = fragments.export(group);
    
    // Save to IndexedDB
    const request = indexedDB.open("FragmentsDB", 1);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains("fragments")) {
        db.createObjectStore("fragments", { keyPath: "id" });
      }
    };
    
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction(["fragments"], "readwrite");
      const store = transaction.objectStore("fragments");
      store.put({ id: "model_fragments", data: data });
      console.log("Fragments saved to IndexedDB");
    };

    /* const properties = group.getLocalProperties();
    if (properties) {
      download(new File([JSON.stringify(properties)], "small.json"));
    } */
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
