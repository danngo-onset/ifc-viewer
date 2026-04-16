import { useBimComponent } from "@/hooks/bim";

import { BimComponent } from "@/domain/enums/bim/BimComponent";

export const VolumeMeasurer = () => {
  const [measurer, updateMeasurer] = useBimComponent(BimComponent.VolumeMeasurer);

  const visible = measurer?.visible ?? false;

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
          onChange={e => updateMeasurer(x => x.visible = e.target.checked)}
          className="rounded"
        />

        <label htmlFor="volume-measurement-visible">Measurement visible</label>
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
