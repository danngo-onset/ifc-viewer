import { useEffect, useState } from "react";

import type * as OBF from "@thatopen/components-front";

import { ChevronDownIcon } from "@radix-ui/react-icons";
import * as Accordion from "@radix-ui/react-accordion";

import Constants from "@/domain/Constants";
import useBimComponent from "@/hooks/useBimComponent";

export const AreaMeasurer = () => {
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);

  const measurer = useBimComponent<OBF.AreaMeasurement>(Constants.AreaMeasurementKey);

  // Update state when measurer becomes available
  useEffect(() => {
    if (measurer) {
      setEnabled(measurer.enabled);
      setVisible(measurer.visible);
    }
  }, [measurer]);

  return (
    <Accordion.Root type="single" collapsible className="w-full">
      <Accordion.Item value="tools-panel" className="border border-gray-300 rounded-md bg-white">
        <Accordion.Header>
          <Accordion.Trigger className="accordion-trigger">
            <p>Area Measurement</p>
            <ChevronDownIcon className="w-4 h-4" />
          </Accordion.Trigger>
        </Accordion.Header>

        <Accordion.Content 
          className="accordion-content"
        >
          <div>
            <label htmlFor="area-measurement-enabled">Enabled</label>

            <input 
              type="checkbox" 
              id="area-measurement-enabled" 
              checked={enabled}
              onChange={(e) => {
                const checked = e.target.checked;
                setEnabled(checked);

                if (measurer) measurer.enabled = checked;
              }}
            />
          </div>

          <div>
            <label htmlFor="area-measurement-visible">Measurement Visible</label>

            <input 
              type="checkbox" 
              id="area-measurement-visible" 
              checked={visible} 
              onChange={(e) => {
                const checked = e.target.checked;
                setVisible(checked);

                if (measurer) measurer.visible = checked;
              }} 
            />
          </div>

          <button 
            className="button-gray"
            onClick={() => {
              measurer?.list.clear();
            }}
          >
            Delete all
          </button>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  );
};
