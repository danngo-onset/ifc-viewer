import { useEffect, useState } from "react";

import  { AngleMeasurement } from "@thatopen/components-front";

import { useBimComponent } from "@/hooks/bim";

import { BimComponent } from "@/domain/enums/bim/BimComponent";

export const AngleMeasurer = () => {
  const [visible, setVisible] = useState(false);
  const [unit, setUnit] = useState<AngleMeasurement.Unit>("deg");
  
  const measurer = useBimComponent(BimComponent.AngleMeasurer);

  useEffect(() => {
    if (measurer) {
      setVisible(measurer.visible);
      setUnit(measurer.units);
    }
  }, [measurer]);

  return (
    <section className="w-48 bim-component-container">
      <ul className="bim-component-guide">
        <li>Double click 3 points to measure</li>
      </ul>

      <div className="justify-start! gap-2! *:cursor-pointer">
        <input 
          type="checkbox" 
          id="angle-measurement-visible" 
          checked={visible} 
          onChange={e => {
            if (!measurer) return;

            const checked = e.target.checked;
            setVisible(checked);

            measurer.visible = checked;
          }} 
          className="rounded"
        />

        <label htmlFor="angle-measurement-visible">Measurement visible</label>
      </div>

      <div className="justify-start! gap-2! *:cursor-pointer">
        <label htmlFor="unit">Unit</label>

        <select 
          id="unit"
          value={unit}
          onChange={e => {
            if (!measurer) return;

            const selectedValue = e.target.value as AngleMeasurement.Unit;

            measurer.units = selectedValue;
            setUnit(selectedValue);
          }}
          className="rounded border border-gray-400 p-1 w-28"
        >
          {measurer?.unitsList.map(unit => 
            <option key={unit} value={unit}>
              {unit}
            </option>
          )}
        </select>
      </div>

      <button 
        className="btn-gray"
        onClick={() => measurer?.list.clear()}
      >
        Delete All
      </button>
    </section>
  )
};
