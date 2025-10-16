import React, { SetStateAction, Dispatch, useEffect, useState } from "react";

import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";

import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDownIcon } from "@radix-ui/react-icons";

import api from "@/lib/api";
import di from "@/lib/di";

import Constants from "@/domain/Constants";

interface TopBarProps {
  readonly isLoading: boolean;
  readonly setIsLoading: Dispatch<SetStateAction<boolean>>;
  readonly setLoadingMessage: Dispatch<SetStateAction<string>>;
}

const TopBar: React.FC<TopBarProps> = ({
  isLoading,
  setIsLoading,
  setLoadingMessage,
}) => {
  const [areaMeasurementEnabled, setAreaMeasurementEnabled] = useState(false);
  const [areaMeasurementVisible, setAreaMeasurementVisible] = useState(false);

  useEffect(() => {
    // Check periodically until services are available, then stop
    const interval = setInterval(() => {
      const areaMeasurer = di.get<OBF.AreaMeasurement>(Constants.AreaMeasurementKey);
      if (areaMeasurer) {
        setAreaMeasurementEnabled(areaMeasurer.enabled);
        setAreaMeasurementVisible(areaMeasurer.visible);
        
        clearInterval(interval); // Stop polling once found
      }
    }, 100);
    
    return () => clearInterval(interval);
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

      const fragmentsManager = di.get<OBC.FragmentsManager>(Constants.FragmentsManagerKey);
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
      const fragmentsManager = di.get<OBC.FragmentsManager>(Constants.FragmentsManagerKey);
      
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
    <section className="flex justify-center items-center space-x-4 py-4 bg-gray-300">
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

      <Accordion.Root type="single" collapsible className="relative z-10 w-48">
        <Accordion.Item value="tools-panel" className="border border-gray-300 rounded-md bg-white">
          <Accordion.Header>
            <Accordion.Trigger className="flex items-center justify-between w-full px-3 py-2 hover:bg-gray-50">
              <p>Area Measurement</p>

              <ChevronDownIcon className="w-4 h-4" />
            </Accordion.Trigger>
          </Accordion.Header>

          <Accordion.Content 
            className="
              px-3 py-2 bg-gray-50 border-t border-gray-200 absolute top-full left-0 right-0 shadow-lg space-y-3 
              *:text-sm *:flex *:items-center *:justify-between
            "
          >
            <div>
              <label htmlFor="enabled">Enabled</label>

              <input 
                type="checkbox" 
                id="enabled" 
                checked={areaMeasurementEnabled}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setAreaMeasurementEnabled(checked);
                  const areaMeasurer = di.get<OBF.AreaMeasurement>(Constants.AreaMeasurementKey);
                  if (areaMeasurer) areaMeasurer.enabled = checked;
                }}
              />
            </div>

            <div>
              <label htmlFor="measurement-visible">
                Measurement Visible
              </label>

              <input 
                type="checkbox" 
                id="measurement-visible" 
                checked={areaMeasurementVisible} 
                onChange={(e) => {
                  const checked = e.target.checked;
                  setAreaMeasurementVisible(checked);
                  const areaMeasurer = di.get<OBF.AreaMeasurement>(Constants.AreaMeasurementKey);
                  if (areaMeasurer) areaMeasurer.visible = checked;
                }} 
              />
            </div>

            <button 
              className="bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600 text-center w-full !block"
              onClick={() => {
                const areaMeasurer = di.get<OBF.AreaMeasurement>(Constants.AreaMeasurementKey);
                areaMeasurer?.list.clear();
              }}
            >
              Delete all
            </button>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
    </section>
  );
};

export default TopBar;
