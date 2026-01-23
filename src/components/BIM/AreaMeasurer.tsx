import { useEffect, useState } from "react";

import { useBimComponent } from "@/hooks/BIM";

import { BimComponent } from "@/domain/enums/BIM/BimComponent";
import { IBimComponentNode } from "@/domain/interfaces/BIM";

export const AreaMeasurer: IBimComponentNode = () => {
  const [visible, setVisible] = useState(false);

  const measurer = useBimComponent(BimComponent.AreaMeasurer);

  useEffect(() => {
    if (measurer) {
      setVisible(measurer.visible);
    }
  }, [measurer]);

  return (
    <section className="w-48 bim-component-container">
      <ul className="bim-component-guide">
        <li>Double click to measure</li>
      </ul>

      <div className="justify-start! gap-2! *:cursor-pointer">
        <input 
          type="checkbox" 
          id="area-measurement-visible" 
          checked={visible} 
          onChange={e => {
            if (!measurer) return;

            const checked = e.target.checked;
            setVisible(checked);

            measurer.visible = checked;
          }} 
          className="rounded"
        />

        <label htmlFor="area-measurement-visible">Measurement visible</label>
      </div>

      <button 
        className="btn-gray"
        onClick={() => measurer?.list.clear()}
      >
        Delete All
      </button>
    </section>
  );
};
