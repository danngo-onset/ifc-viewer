import type { SubmitEvent, ChangeEvent } from "react";

import { httpClient } from "@/api";

import { useUiStoreShallow } from "@/store";

import { useBimComponent } from "@/hooks/bim";

import { BimComponent } from "@/domain/enums/bim/BimComponent";

import { NavigationRailDrawer } from "@/components/ui/NavigationRailDrawer";
import { RightDrawer } from "@/components/ui/RightDrawer";
import { DarkSceneToggle } from "@/components/bim";

export const TopBar = () => {
  const [world] = useBimComponent(BimComponent.World);
  const [fragmentsManager] = useBimComponent(BimComponent.FragmentsManager);

  const { isLoading, setIsLoading, setLoadingMessage } = useUiStoreShallow(s => ({
    isLoading: s.isLoading,
    setIsLoading: s.setIsLoading,
    setLoadingMessage: s.setLoadingMessage
  }));

  async function loadIfc(e: ChangeEvent<HTMLInputElement>) {
    if (!world || !fragmentsManager ) return;
    
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setLoadingMessage("Uploading and processing IFC file...");

    try {
      const formData = new FormData();
      formData.append("file", file);
    
      const response = await httpClient.post("/fragments", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        }
      });
    
      setLoadingMessage("Loading fragments into viewer...");
    
      const buffer = Uint8Array.from(
        atob(response.data.fragments), 
        c => c.charCodeAt(0)
      ).buffer;

      const model = await fragmentsManager.core.load(buffer, { modelId: response.data.id });
      world.scene.three.add(model.object);
    } catch (error) {
      console.error("Error loading fragments:", error);
      setIsLoading(false);
    } finally {
      if (e.target) {
        e.target.value = "";
      }
    }
  }

  async function loadById(e: SubmitEvent<HTMLFormElement>) {
    if (!world || !fragmentsManager) return;
    
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const id = formData.get("id") as string;
    
    if (!id.trim()) return;

    try {
      setIsLoading(true);
      setLoadingMessage(`Loading model: ${id}...`);

      const response = await httpClient.get(`/fragments/${id}`);
      
      const buffer = Uint8Array.from(
        atob(response.data.fragments), 
        c => c.charCodeAt(0)
      ).buffer;

      const model = await fragmentsManager.core.load(buffer, { modelId: id });
      world.scene.three.add(model.object);
    } catch (error) {
      console.error("Error loading fragments by ID:", error);
      setIsLoading(false);
    }

    // Clear the form input
    const form = e.currentTarget;
    if (form) {
      const input = form.querySelector('input[name="id"]') as HTMLInputElement;
      if (input) {
        input.value = "";
      }
    }
  }

  return (
    <section className="flex justify-center items-center space-x-4 py-4 bg-gray-300 relative z-1">
      <NavigationRailDrawer />

      <div>
        <input 
          type="file" 
          accept=".ifc" 
          onChange={loadIfc} 
          id="file-input" 
          className="hidden"
          disabled={isLoading} 
        />

        <label 
          htmlFor="file-input" 
          id="upload-ifc-btn"
          data-disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Upload an IFC file"}
        </label>
      </div>

      <form onSubmit={loadById} className="flex items-center space-x-2">
        <label htmlFor="id" className="text-sm">
          ID:
        </label>

        <input 
          type="text" 
          id="id" 
          name="id"
          className="border border-black rounded-md p-2"
          disabled={isLoading} 
        />

        <button 
          type="submit" 
          id="load-frags-btn"
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Load"}
        </button>
      </form>

      <DarkSceneToggle />

      <RightDrawer />
    </section>
  );
};
