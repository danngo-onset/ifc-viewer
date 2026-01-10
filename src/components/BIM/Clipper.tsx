import { useEffect, useState } from "react";

import type * as OBC from "@thatopen/components";

import { BimComponent } from "@/domain/enums/BIM/BimComponent";

import { useBimComponent } from "@/hooks/BIM";

export const Clipper = () => {
  const [visible, setVisible] = useState(false);

  const clipper = useBimComponent<OBC.Clipper>(BimComponent.Clipper);

  useEffect(() => {
    if (clipper) {
      setVisible(clipper.visible);
    }
  }, [clipper]);

  return (
    <section className="w-64 bim-component-container">
      <ul className="bim-component-guide">
        <li>Double click to create clipping plane</li>
        <li>CTRL + Click to delete clipping plane</li>
      </ul>

      <div className="justify-start! gap-2! *:cursor-pointer">
        <input 
          type="checkbox" 
          id="clipper-visible" 
          checked={visible} 
          onChange={e => {
            const checked = e.target.checked;
            setVisible(checked);

            if (clipper) clipper.visible = checked;
          }} 
        />

        <label htmlFor="clipper-visible">Clipper visible</label>
      </div>

      <button 
        className="btn-gray"
        onClick={() => {
          if (!clipper) return;

          for (const clipping of clipper.list.values()) {
            clipping.enabled = !clipping.enabled;
          }
        }}
      >
        Toggle Clippings
      </button>

      <button 
        className="btn-gray"
        onClick={() => {
          clipper?.deleteAll();
        }}
      >
        Delete All
      </button>
    </section>
  );
};
