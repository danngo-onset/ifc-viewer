import { useEffect, useState } from "react";

import * as OBF from "@thatopen/components-front";

import { ChevronDownIcon } from "@radix-ui/react-icons";
import * as Accordion from "@radix-ui/react-accordion";

import di from "@/lib/di";

import Constants from "@/domain/Constants";

export const AreaMeasurer = () => {
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

  return (
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
            <label htmlFor="area-measurement-enabled">Enabled</label>

            <input 
              type="checkbox" 
              id="area-measurement-enabled" 
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
            <label htmlFor="area-measurement-visible">Measurement Visible</label>
            
            <input 
              type="checkbox" 
              id="area-measurement-visible" 
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
  );
};
