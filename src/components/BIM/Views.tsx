import { useEffect, useRef, useState } from "react";

import * as OBC from "@thatopen/components";
import type * as TBUI from "@thatopen/ui";

import { useBimComponent } from "@/hooks/BIM";

import { BimComponent } from "@/domain/enums/BIM/BimComponent";

type ViewsListTableData = {
  Name    : string;
  Actions : string;
}

interface ViewsListState {
  components: OBC.Components;
}

export const Views = () => {
  const panelContainerRef = useRef<HTMLDivElement>(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [viewsEnabled, setViewsEnabled] = useState(false);

  const fragmentsManager = useBimComponent(BimComponent.FragmentsManager);
  useEffect(() => {
    if (!fragmentsManager) return;

    const modelCountHandler = () => {
      setModelLoaded(true);
    };
    fragmentsManager.list.onItemSet.add(modelCountHandler);

    return () => {
      setModelLoaded(false);
      fragmentsManager.list.onItemSet.remove(modelCountHandler);
    };
  }, [fragmentsManager]);

  const views = useBimComponent(BimComponent.Views);
  useEffect(() => {
    if (!views) return;

    const containerElement = panelContainerRef.current;
    let panelElement: HTMLElement | null = null;

    (async () => {
      const BUI = await import("@thatopen/ui");

      const viewsTemplate: TBUI.StatefullComponent<ViewsListState> = (state) => {
        // Might not be needed
        const stateComponents = state.components;
        const stateViews = stateComponents.get(OBC.Views);

        const onCreated = (e?: Element) => {
          if (!e) return;

          const table = e as TBUI.Table<ViewsListTableData>;
          table.data = [...stateViews.list.keys()].map(key => {
            return {
              data: {
                Name    : key,
                Actions : ""
              }
            };
          });
        };

        return BUI.html`<bim-table ${BUI.ref(onCreated)}></bim-table>`;
      };

      const [viewsTable, updateViewsTable] = BUI.Component.create<
        TBUI.Table<ViewsListTableData>,
        ViewsListState
      >(viewsTemplate, { components: views.components });

      viewsTable.headersHidden = true;
      viewsTable.noIndentation = true;
      viewsTable.columns = ["Name", { name: "Actions", width: "auto" }];

      viewsTable.dataTransform = {
        Actions: (value, rowData) => {
          const { Name } = rowData;
          if (!Name) return value;

          const view = views.list.get(Name);
          if (!view) return value;

          const onOpen = () => {
            views.open(Name);
          };

          const onRemove = () => {
            views.list.delete(Name);
          };

          return BUI.html`
            <bim-button 
              label-hidden 
              icon="solar:cursor-bold"
              label="Open"
              @click=${onOpen}
            ></bim-button>

            <bim-button 
              label-hidden 
              icon="material-symbols:delete"
              label="Remove"
              @click=${onRemove}
            ></bim-button>
          `;
        }
      };

      const updateFunction = () => updateViewsTable();
      views.list.onItemSet.add(updateFunction);
      views.list.onItemDeleted.add(updateFunction);
      views.list.onItemUpdated.add(updateFunction);
      views.list.onCleared.add(updateFunction);

      const panel = BUI.Component.create<TBUI.PanelSection>(() => {
        const onCloseView = () => views.close();

        return BUI.html`
          <bim-panel active label="2D Views" class="options-menu">
            <bim-panel-section label="Info">
              <bim-label>
                Double click to create a new view
              </bim-label>
            </bim-panel-section>

            <bim-panel-section label="Views">
              <bim-button label="Close active 2D View" @click=${onCloseView}></bim-button>

              ${viewsTable}
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
  }, [views, modelLoaded]);

  useEffect(() => {
    if (views) {
      setViewsEnabled(views.enabled);
    }
  }, [views]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 *:cursor-pointer">
        <input 
          type="checkbox" 
          id="views-enabled" 
          checked={viewsEnabled} 
          onChange={e => {
            const checked = e.target.checked;
            setViewsEnabled(checked);
            
            if (views) views.enabled = checked;
          }} 
          className="rounded"
        />

        <label htmlFor="views-enabled">2D Views enabled</label>
      </div>

      <div className="overflow-auto" ref={panelContainerRef} />
    </div>
  );
};
