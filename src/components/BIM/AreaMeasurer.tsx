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

      <div>
        <label htmlFor="area-measurement-visible">Measurement visible</label>

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
        className="btn-gray"
        onClick={() => {
          measurer?.list.clear();
        }}
      >
        Delete all
      </button>
    </section>
  );
};
