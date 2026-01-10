import { useEffect, useState } from "react";

import type * as OBCF from "@thatopen/components-front";

import { useBimComponent } from "@/hooks/BIM";

import { BimComponent } from "@/domain/enums/BIM/BimComponent";

export const AreaMeasurer = () => {
  const [visible, setVisible] = useState(false);

  const measurer = useBimComponent<OBCF.AreaMeasurement>(BimComponent.AreaMeasurer);

  useEffect(() => {
    if (measurer) {
      setVisible(measurer.visible);
    }
  }, [measurer]);

  return (
    <section 
      className="w-48 bim-component-container"
    >
      <ul className="bim-component-guide">
        <li>Double click to measure</li>
      </ul>

      <div className="justify-start! gap-2! *:cursor-pointer">
        <input 
          type="checkbox" 
          id="area-measurement-visible" 
          checked={visible} 
          onChange={e => {
            const checked = e.target.checked;
            setVisible(checked);

            if (measurer) measurer.visible = checked;
          }} 
          className="rounded"
        />

        <label htmlFor="area-measurement-visible">Measurement visible</label>
      </div>

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
