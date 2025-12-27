import type * as OBC from "@thatopen/components";

import { api } from "@/lib";

import { useBimComponent } from "@/hooks/BIM";

import { BimComponent } from "@/domain/enums/BIM/BimComponent";

import type { SetState } from "@/domain/types/SetState";

import { NavigationRailDrawer } from ".";

type TopBarProps = {
  readonly isLoading: boolean;
  readonly setIsLoading: SetState<boolean>;
  readonly setLoadingMessage: SetState<string>;
};

export const TopBar = ({
  isLoading,
  setIsLoading,
  setLoadingMessage,
}: TopBarProps) => {
  const fragmentsManager = useBimComponent<OBC.FragmentsManager>(BimComponent.FragmentsManager);

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

      await fragmentsManager?.core.load(buffer, { modelId: response.data.id });
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

    try {
      if (!fragmentsManager) {
        console.error("FragmentsManager not available yet");
        return;
      }
      
      setIsLoading(true);
      setLoadingMessage(`Loading model: ${id}...`);

      const response = await api.get(`/fragments/${id}`);
      
      const buffer = Uint8Array.from(
        atob(response.data.fragments), 
        c => c.charCodeAt(0)
      ).buffer;

      await fragmentsManager.core.load(buffer, { modelId: id });
    } catch (error) {
      console.error('Error loading fragments by ID:', error);
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
    <section className="flex justify-center items-center space-x-4 py-4 bg-gray-300 relative">
      <NavigationRailDrawer 
        isLoading={isLoading} 
      />

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

        <input 
          type="text" 
          id="id" 
          name="id"
          className="border border-black rounded-md p-2"
          disabled={isLoading} 
        />

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
  );
};
