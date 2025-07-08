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
    async function loadIfc() {
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

        
        fragments.onFragmentsLoaded.add((model) => {
          console.log(model);
        });

        // Set WASM file location
        fragmentIfcLoader.settings.wasm = {
          path: '/web-ifc.wasm',
          absolute: false
        };

        await fragmentIfcLoader.setup();

        const excludedCats = [
          WEBIFC.IFCTENDONANCHOR,
          WEBIFC.IFCREINFORCINGBAR,
          WEBIFC.IFCREINFORCINGELEMENT
        ];

        for (const cat of excludedCats) {
          fragmentIfcLoader.settings.excludedCategories.add(cat);
        }

        fragmentIfcLoader.settings.webIfc.COORDINATE_TO_ORIGIN = true;
      }
    }

    loadIfc();

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
    } catch (error) {
      console.error('Error loading IFC file:', error);
      // You might want to show this error to the user in a more friendly way
    }
  }

  return (
    <>
      <input type="file" accept=".ifc" onChange={loadIfc} id="file-input" className="hidden" />
      <label htmlFor="file-input" className="cursor-pointer border border-gray-300 rounded-md p-2 bg-blue-200">Select an IFC file</label>

      <div 
        ref={containerRef} 
        id="container" 
        className="bg-white! h-screen"
      >
      </div>
    </>
    
  );
}
