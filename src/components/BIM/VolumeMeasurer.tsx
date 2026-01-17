import { useEffect, useState } from "react";

import { useBimComponent } from "@/hooks/BIM";

import { BimComponent } from "@/domain/enums/BIM/BimComponent";

export const VolumeMeasurer = () => {
  const [visible, setVisible] = useState(false);

  const measurer = useBimComponent(BimComponent.VolumeMeasurer);

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
          id="volume-measurement-visible" 
          checked={visible} 
          onChange={e => {
            if (!measurer) return;

            const checked = e.target.checked;
            setVisible(checked);

            console.log("visible", measurer.visible); // TODO: not working
            measurer.visible = checked;
          }} 
          className="rounded"
        />

        <label htmlFor="volume-measurement-visible">Measurement visible</label>
      </div>

      <button 
        className="btn-gray"
        onClick={() => {
          console.log(measurer?.list.values());  // TODO: not working
          measurer?.list.clear();
        }}
      >
        Delete All
      </button>
    </section>
  );
};
