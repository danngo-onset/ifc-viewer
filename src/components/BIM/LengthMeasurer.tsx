import { useEffect, useState } from "react";

import * as OBF from "@thatopen/components-front";

import { ChevronDownIcon } from "@radix-ui/react-icons";
import * as Accordion from "@radix-ui/react-accordion";

import Constants from "@/domain/Constants";

import useBimComponent from "@/hooks/useBimComponent";

export default function LengthMeasurer() {
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);

  const measurer = useBimComponent<OBF.LengthMeasurement>(Constants.LengthMeasurementKey);

  useEffect(() => {
    if (measurer) {
      setEnabled(measurer.enabled);
      setVisible(measurer.visible);
    }
  }, [measurer]);

  return (
    <Accordion.Root type="single" collapsible className="relative z-10 w-52">
      <Accordion.Item value="tools-panel" className="border border-gray-300 rounded-md bg-white">
        <Accordion.Header>
          <Accordion.Trigger className="accordion-trigger">
            <p>Length Measurement</p>
            <ChevronDownIcon className="w-4 h-4" />
          </Accordion.Trigger>
        </Accordion.Header>

        <Accordion.Content 
          className="accordion-content"
        >
          <div>
            <label htmlFor="length-measurement-enabled">Enabled</label>

            <input 
              type="checkbox" 
              id="length-measurement-enabled" 
              checked={enabled}
              onChange={(e) => {
                const checked = e.target.checked;
                setEnabled(checked);

                if (measurer) measurer.enabled = checked;
              }}
            />
          </div>

          <div>
            <label htmlFor="length-measurement-visible">Measurement Visible</label>

            <input 
              type="checkbox" 
              id="length-measurement-visible" 
              checked={visible} 
              onChange={(e) => {
                const checked = e.target.checked;
                setVisible(checked);

                if (measurer) measurer.visible = checked;
              }} 
            />
          </div>

          {/* Rectangular dimensions represent measurements aligned to the X and Y axes when viewed in 2D.
            These dimensions complete the triangle formed by the linear dimension. */}
          <button 
            className="button-gray"
            onClick={() => {
              if (!measurer) return;

              for (const dimension of measurer.lines) {
                dimension.displayRectangularDimensions();
              }
            }}
          >
            Display Rectangle Dimensions
          </button>

          <button 
            className="button-gray"
            onClick={() => {
              if (!measurer) return;

              for (const dimension of measurer.lines) {
                dimension.invertRectangularDimensions();
              }
            }}
          >
            Invert Rectangle Dimensions
          </button>

          {/* Projection dimensions represent the measurements projected onto the planes 
          defined by the normal direction of each click used to create the initial measurement.*/}
          <button 
            className="button-gray"
            onClick={() => {
              if (!measurer) return;

              for (const dimension of measurer.lines) {
                dimension.displayProjectionDimensions();
              }
            }}
          >
            Display Projection Dimensions
          </button>

          <button 
            className="button-gray"
            onClick={() => {
              if (!measurer) return;

              for (const dimension of measurer.lines) {
                dimension.rectangleDimensions.clear();
                dimension.projectionDimensions.clear();
              }
            }}
          >
            Clear Complementary Dimensions
          </button>

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
}
