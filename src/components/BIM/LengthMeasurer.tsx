import { useEffect, useState } from "react";

import { BimComponent } from "@/domain/enums/BIM/BimComponent";

import { useBimComponent } from "@/hooks/BIM";

export const LengthMeasurer = () => {
  const [visible, setVisible] = useState(false);

  const measurer = useBimComponent(BimComponent.LengthMeasurer);

  useEffect(() => {
    if (measurer) {
      setVisible(measurer.visible);
    }
  }, [measurer]);

  return (
    <section 
      className="w-64 bim-component-container"
    >
      <ul className="bim-component-guide">
        <li>Double click to measure</li>
      </ul>

      <div className="justify-start! gap-2! *:cursor-pointer">
        <input 
          type="checkbox" 
          id="length-measurement-visible" 
          checked={visible} 
          onChange={e => {
            const checked = e.target.checked;
            setVisible(checked);

            if (measurer) measurer.visible = checked;
          }} 
          className="rounded"
        />

        <label htmlFor="length-measurement-visible">Measurement visible</label>
      </div>

      {/* Rectangular dimensions represent measurements aligned to the X and Y axes when viewed in 2D.
        These dimensions complete the triangle formed by the linear dimension. */}
      <button 
        className="btn-gray"
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
        className="btn-gray"
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
        className="btn-gray"
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
        className="btn-gray"
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
        className="btn-gray"
        onClick={() => {
          measurer?.list.clear();
        }}
      >
        Delete All
      </button>
    </section>
  );
};
