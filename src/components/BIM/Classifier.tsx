import { useEffect, useRef, useState } from "react";

import * as OBC from "@thatopen/components";
import * as BUI from "@thatopen/ui";

import useBimComponent from "@/hooks/useBimComponent";

import Constants from "@/domain/Constants";

export const Classifier = () => {
  const panelContainerRef = useRef<HTMLDivElement>(null);
  const [modelCount, setModelCount] = useState(0);

  const components = useBimComponent<OBC.Components>(Constants.ComponentsKey);
  const fragmentsManager = useBimComponent<OBC.FragmentsManager>(Constants.FragmentsManagerKey);

  useEffect(() => {
    if (!fragmentsManager) return;

    const modelCountHandler = () => {
      setModelCount(fragmentsManager.list.size);
    };
    fragmentsManager.list.onItemSet.add(modelCountHandler);

    return () => {
      fragmentsManager.list.onItemSet.remove(modelCountHandler);
    };
  }, [fragmentsManager]);

  useEffect(() => {
    if (!components || !fragmentsManager) return;

    const containerElement = panelContainerRef.current;
    let panelElement: HTMLElement | null = null;

    (async () => {
      const BUI = await import("@thatopen/ui");

      // TODO: init this once globally
      BUI.Manager.init();
      
      const hider = components.get(OBC.Hider);

      async function isolateByCategory(categories: string[]) {
        if (!fragmentsManager || !hider) return;

        // An OBC.ModelIdMapp represents selection within the engine
        // This defines a selection of the loaded model
        // that includes all items belonging to the specified category
        const modelIdMap: OBC.ModelIdMap = {};

        const categoriesRegex = categories.map(x => new RegExp(`^${x}$`));

        for (const [, model] of fragmentsManager.list) {
          const items = await model.getItemsOfCategories(categoriesRegex);
          const localIds = Object.values(items).flat();

          modelIdMap[model.modelId] = new Set(localIds);
        }

        await hider.isolate(modelIdMap);
      };

      async function hideByCategory(categories: string[]) {
        if (!fragmentsManager || !hider) return;

        const modelIdMap: OBC.ModelIdMap = {};

        const categoriesRegex = categories.map(x => new RegExp(`^${x}$`));

        for (const [, model] of fragmentsManager.list) {
          const items = await model.getItemsOfCategories(categoriesRegex);
          const localIds = Object.values(items).flat();

          modelIdMap[model.modelId] = new Set(localIds);
        }

        await hider.set(false, modelIdMap);
      }

      async function resetVisibility() {
        if (!hider) return;

        await hider.set(true);
      }

      const categoriesDropdownTemplate = () => {
        const onCreated = async (e?: Element) => {
          if (!e) return;
          
          const dropdown = e as BUI.Dropdown;

          const modelCategories = new Set<string>();
          for (const [, model] of fragmentsManager.list) {
            const categories = await model.getItemsWithGeometryCategories();

            for (const category of categories) {
              if (!category) continue;

              modelCategories.add(category);
            }
          }

          for (const category of modelCategories) {
            const option = BUI.Component.create(
              () => BUI.html`<bim-option style="padding: 0.25rem;" label=${category}></bim-option>`
            );
            dropdown.append(option);
          }
        };

        return BUI.html`
          <bim-dropdown multiple ${BUI.ref(onCreated)}></bim-dropdown>
        `;
      };

      const panel = BUI.Component.create<BUI.PanelSection>(() => {
        const categoriesDropdownA = BUI.Component.create<BUI.Dropdown>(categoriesDropdownTemplate);
        const categoriesDropdownB = BUI.Component.create<BUI.Dropdown>(categoriesDropdownTemplate);

        const onIsolateCategory = async({ target }: { target: BUI.Button }) => {
          if (!categoriesDropdownA) return;

          const categories = categoriesDropdownA.value;
          if (categories.length === 0) return;

          target.loading = true;

          await isolateByCategory(categories);

          target.loading = false;
        };

        const onHideCategory = async({ target }: { target: BUI.Button }) => {
          if (!categoriesDropdownB) return;

          const categories = categoriesDropdownB.value;
          if (categories.length === 0) return;

          target.loading = true;

          await hideByCategory(categories);

          target.loading = false;
        };
        
        const onResetVisibility = async({ target }: { target: BUI.Button }) => {
          target.loading = true;

          await resetVisibility();

          target.loading = false;
        };

        return BUI.html`
          <bim-panel active label="Classifier" class="options-menu">
            <bim-panel-section style="width: 14rem" label="General">
              <bim-button label="Reset Visibility" @click=${onResetVisibility}></bim-button>
            </bim-panel-section>
            
            <bim-panel-section label="Isolation">
              ${categoriesDropdownA}
              <bim-button label="Isolate Category" @click=${onIsolateCategory}></bim-button>
            </bim-panel-section>

            <bim-panel-section label="Hiding">
              ${categoriesDropdownB}
              <bim-button label="Hide Category" @click=${onHideCategory}></bim-button>
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
  }, [components, fragmentsManager, modelCount]);

  return (
    <div className="overflow-auto max-h-1/2" ref={panelContainerRef} />
  );
};
