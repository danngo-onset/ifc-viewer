import { useEffect, useRef } from "react";

import type * as OBC from "@thatopen/components";
import type { Table } from "@thatopen/ui";
import type { SpatialTreeData } from "@thatopen/ui-obc";

import useBimComponent from "@/hooks/useBimComponent";

import Constants from "@/domain/Constants";

type ModelInspectorProps = {
  readonly isLoading: boolean;
};

export const ModelInspector = ({ isLoading }: ModelInspectorProps) => {
  const panelContainerRef = useRef<HTMLDivElement>(null);
  
  const components = useBimComponent<OBC.Components>(Constants.ComponentsKey);
  const fragmentsManager = useBimComponent<OBC.FragmentsManager>(Constants.FragmentsManagerKey);

  useEffect(() => {
    if (!components || !fragmentsManager) return;
    
    let panelElement: HTMLElement | null = null;
    
    (async () => {
      const [BUI, BUIC] = await Promise.all([
        import("@thatopen/ui"),
        import("@thatopen/ui-obc")
      ]);

      BUI.Manager.init();

      const spatialTree: Table<SpatialTreeData> = BUIC.tables.spatialTree({
        components,
        models: [],
      })[0];
      spatialTree.preserveStructureOnFilter = true;
      spatialTree.style.cursor = "pointer";

      const panel = BUI.Component.create(() => {
        const onSearch = (e: Event) => {
          const input = e.target as HTMLInputElement | null;
          if (input?.value !== undefined) {
            spatialTree.queryString = input.value;
          }
        };

        return BUI.html`
          <bim-panel label="Model Inspector">
            <bim-panel-section label="Model Tree">
              <bim-text-input 
                placeholder="Search..." 
                debounce="200" 
                @input=${onSearch}
              ></bim-text-input>
              ${spatialTree}
            </bim-panel-section>
          </bim-panel>
        `;
      });

      panelElement = panel;

      if (panelContainerRef.current) {
        panelContainerRef.current.innerHTML = "";
        panelContainerRef.current.appendChild(panelElement);

        setTimeout(() => {
          const bimPanelSection = panelContainerRef
            .current
            ?.querySelector('bim-panel-section[label="Model Tree"]') as HTMLElement;
            
          if (bimPanelSection?.shadowRoot) {
            const header = bimPanelSection.shadowRoot.querySelector("div.header") as HTMLElement;
            if (header) {
              const label = header.querySelector("bim-label") as HTMLElement;
              if (label?.shadowRoot) {
                const labelStyle = document.createElement("style");
                labelStyle.textContent = `
                  div.parent {
                    font-size: 0.75rem;
                  }
                `;
                label.shadowRoot.appendChild(labelStyle);
              }
            }
          }
        }, 0);
      }
    })();

    return () => {
      if (panelElement && panelContainerRef.current?.contains(panelElement)) {
        panelContainerRef.current.removeChild(panelElement);
      }
    };
  }, [components, fragmentsManager]);

  if (!components || !fragmentsManager) {
    return (
      <div className="p-4 text-sm text-gray-500">
        {isLoading ? "Loading model structure..." : "No models loaded"}
      </div>
    );
  }

  return (
    <div className="overflow-auto max-h-1/2" ref={panelContainerRef} />
  );
};
