import { useEffect, useRef } from "react";

import type * as OBC from "@thatopen/components";
import type { Table, UpdateFunction } from "@thatopen/ui";
import type { ItemsDataTableData, ItemsDataState } from "@thatopen/ui-obc";

import { useBimComponent } from "@/hooks/BIM";

import { BimComponent } from "@/domain/enums/BIM/BimComponent";

type Props = {
  isLoading: boolean;
};

export const ItemInspector = ({ isLoading }: Props) => {
  const panelContainerRef = useRef<HTMLDivElement>(null);
  
  const components = useBimComponent(BimComponent.Components);
  const fragmentsManager = useBimComponent(BimComponent.FragmentsManager);
  const highlighter = useBimComponent(BimComponent.Highlighter);

  useEffect(() => {
    if (!components || !fragmentsManager || !highlighter) return;

    const containerElement = panelContainerRef.current;
    let panelElement: HTMLElement | null = null;
    let highlightHandler: (modelIdMap: OBC.ModelIdMap) => void;
    let highlightClearHandler: () => void;
    
    (async () => {
      const [BUI, BUIC] = await Promise.all([
        import("@thatopen/ui"),
        import("@thatopen/ui-obc")
      ]);

      const itemsData = BUIC.tables.itemsData({
        components,
        modelIdMap: {}
      });
      const propertiesTable: Table<ItemsDataTableData> = itemsData[0];
      const updatePropertiesTable: UpdateFunction<ItemsDataState> = itemsData[1];

      propertiesTable.preserveStructureOnFilter = true;
      propertiesTable.indentationInText = false;
      propertiesTable.style.cursor = "pointer";

      highlightHandler = (modelIdMap: OBC.ModelIdMap) => updatePropertiesTable({ modelIdMap });
      highlightClearHandler = () => updatePropertiesTable({ modelIdMap: {} });
      highlighter.events.select.onHighlight.add(highlightHandler);
      highlighter.events.select.onClear.add(highlightClearHandler);

      const panel = BUI.Component.create(() => {
        const onTextInput = (e: Event) => {
          const input = e.target as HTMLInputElement | null;
          if (!input) return;

          propertiesTable.queryString = input.value !== "" ? input.value : null;
        };
      
        const expandTable = (e: Event) => {
          const button = e.target as { label: string } | null;
          if (!button) return;

          propertiesTable.expanded = !propertiesTable.expanded;
          button.label = propertiesTable.expanded ? "Collapse" : "Expand";
        };
      
        const copyAsTSV = async () => {
          await navigator.clipboard.writeText(propertiesTable.tsv);
        };
      
        return BUI.html`
          <bim-panel label="Properties" >
            <bim-panel-section label="Item Properties">
              <div style="display: flex; gap: 0.5rem;">
                <bim-button 
                  @click=${expandTable} 
                  label=${propertiesTable.expanded ? "Collapse" : "Expand"}
                ></bim-button> 

                <bim-button 
                  @click=${copyAsTSV} 
                  label="Copy as TSV"
                ></bim-button> 
              </div> 

              <bim-text-input 
                @input=${onTextInput} 
                placeholder="Search Property" debounce="250"
              ></bim-text-input>

              ${propertiesTable}
            </bim-panel-section>
          </bim-panel>
        `;
      });

      panelElement = panel;

      if (containerElement) {
        containerElement.innerHTML = "";
        containerElement.appendChild(panelElement);

        setTimeout(() => {
          const bimPanelSection = containerElement
            ?.querySelector('bim-panel-section[label="Item Properties"]') as HTMLElement;
            
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
      if (panelElement && containerElement?.contains(panelElement)) {
        containerElement.removeChild(panelElement);
      }

      highlighter.events.select.onHighlight.remove(highlightHandler);
      highlighter.events.select.onClear.remove(highlightClearHandler);
    };
  }, [components, fragmentsManager, highlighter]);

  if (!components || !fragmentsManager || !highlighter) {
    return (
      <div className="p-4 text-sm text-gray-500">
        {isLoading ? "Loading item properties..." : "No item selected"}
      </div>
    );
  }

  return (
    <div className="overflow-auto max-h-1/2" ref={panelContainerRef} />
  );
};
