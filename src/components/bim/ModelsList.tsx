import { useRef, useEffect } from "react";

import type { ModelsListState } from "@thatopen/ui-obc";

import { useBimComponent } from "@/hooks/bim";

import { BimComponent } from "@/domain/enums/bim/BimComponent";

export const ModelsList = () => {
  const panelContainerRef = useRef<HTMLDivElement>(null);

  const [components] = useBimComponent(BimComponent.Components);
  
  useEffect(() => {
    if (!components) return;
    
    const containerElement = panelContainerRef.current;
    let panelElement: HTMLElement | null = null;
    
    (async () => {
      const [BUI, BUIC] = await Promise.all([
        import("@thatopen/ui"),
        import("@thatopen/ui-obc")
      ]);

      const modelListState: ModelsListState = {
        components,
        metaDataTags: ["schema"],
        actions: {
          download: false
        }
      };
      const [modelsList] = BUIC.tables.modelsList(modelListState);

      const panel = BUI.Component.create(() => {
        return BUI.html`
          <bim-panel label="BIM Models">
            <bim-panel-section icon="mage:box-3d-fill" label="Loaded Models">
              ${modelsList}
            </bim-panel-section>
          </bim-panel> 
        `;
      });

      panelElement = panel;

      if (containerElement) {
        containerElement.innerHTML = "";
        containerElement.appendChild(panelElement);
      }
    })();

    return () => {
      if (panelElement && containerElement?.contains(panelElement)) {
        containerElement.removeChild(panelElement);
      }
    };
  }, [components]);
  
  return <div className="overflow-auto" ref={panelContainerRef} />
};
