import { useEffect, useState, useRef } from "react";

import type * as OBF from "@thatopen/components-front";

import useBimComponent from "@/hooks/useBimComponent";

import Constants from "@/domain/Constants";

type AreaMeasurerProps = {
  readonly onClose: () => void;
}

export const AreaMeasurer = ({ onClose }: AreaMeasurerProps) => {
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const measurer = useBimComponent<OBF.AreaMeasurement>(Constants.AreaMeasurementKey);

  useEffect(() => {
    if (measurer) {
      setVisible(measurer.visible);
    }
  }, [measurer]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sectionRef.current && !sectionRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

    return (
      <section 
        ref={sectionRef}
        className="w-48 flex flex-col space-y-3 absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-white border border-gray-300 rounded-lg shadow-lg p-4 *:text-sm *:flex *:items-center *:justify-between"
      >
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
    </section>
  );
};
