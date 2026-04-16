import { useEffect, useRef } from "react";

import { FragmentsManager, Components, Hider } from "@thatopen/components";
import type { FragmentsModel } from "@thatopen/fragments";
import type { ChartLegend, Button } from "@thatopen/ui";
import type { ChartAttributesState } from "@thatopen/ui-obc";

import { useBimComponent } from "@/hooks/bim";

import { BimComponent } from "@/domain/enums/bim/BimComponent";

export const ModelAttributes = () => {
  const panelContainerRef = useRef<HTMLDivElement>(null);

  const [components] = useBimComponent(BimComponent.Components);

  useEffect(() => {
    if (!components) return;

    const abortController = new AbortController();

    const fragmentsManager = components.get(FragmentsManager);
  
    let modelSetHandler: (event: { value: FragmentsModel }) => Promise<void>;

    const containerElement = panelContainerRef.current;
    let panelElement: HTMLElement | null = null;

    (async () => {
      const [BUI, BUIC] = await Promise.all([
        import("@thatopen/ui"),
        import("@thatopen/ui-obc")
      ]);

      const pieChartState: ChartAttributesState = {
        type: "pie",
        addLabels: false,
        attribute: /empty/,
        category: /empty/,
        modelId: "",
        components : components as Components
      };
      const [pieChart, updatePieChart] = BUIC.charts.attributesChart(pieChartState);
  
      const barChartState: ChartAttributesState = {
        type: "bar",
        addLabels: false,
        attribute: /empty/,
        category: /empty/,
        modelId: "",
        components : components as Components
      };
      const [barChart, updateBarChart] = BUIC.charts.attributesChart(barChartState);
  
      const labels = BUI.Component.create(() => {
        return BUI.html`
          <bim-chart-legend>
            <bim-label 
              slot="no-chart" 
              icon="ph:warning-fill"
              style="--bim-icon--c: gold;"
            >
              No charts attached
            </bim-label>
  
            <bim-label
              slot="missing-data"
              icon="ph:warning-fill"
              style="--bim-icon--c: gold;"
            >
              No data to display
            </bim-label>
          </bim-chart-legend>
        `;
      }) as ChartLegend;
  
      const hider = components.get(Hider);
      
      labels.addEventListener(
        "label-click",
        async e => {
          const { data, visibility } = (e as CustomEvent).detail;
  
          for (const info of data) {
            const { modelIdMap } = info;
            await hider.set(visibility, modelIdMap);
          }
        },
        { signal: abortController.signal }
      );
  
      pieChart.addEventListener(
        "data-loaded",
        () => {
          labels.charts = [...labels.charts, pieChart];
        },
        { signal: abortController.signal }
      );
  
      barChart.addEventListener(
        "data-loaded",
        () => {
          labels.charts = [...labels.charts, barChart];
        },
        { signal: abortController.signal }
      );
  
      modelSetHandler = async ({ value: model }: { value: FragmentsModel }) => {
        await fragmentsManager.core.update(true);

        // TODO: the attribute and category should be dynamic
        const chartState: Partial<ChartAttributesState> = {
          attribute: /name/i,
          category: /door/i,
          modelId: model.modelId
        };
  
        updatePieChart(chartState);
        updateBarChart(chartState);

        pieChart.label = "Pie Chart Data";
        barChart.label = "Bar Chart Data";
      };
      fragmentsManager.list.onItemSet.add(modelSetHandler);

      // Iterate through the models currently in fragmentsManager to set the charts data
      // This is not ideal
      for (const model of fragmentsManager.list.values()) {
        await modelSetHandler({ value: model });
      }
  
      const highlightButton = BUI.Component.create(() => {
        return BUI.html`
          <bim-button 
            label="Highlight" 
            @click=${({ target }: { target: Button }) => {
              target.loading= true;
  
              pieChart.highlight((entry) => {
                if (!("value" in entry)) return false;
  
                return entry.value > 100;
              });
  
              /* barChart.highlight((entry) => {
                if (!("value" in entry)) return false;
  
                return entry.value > 100;
              });
  
              target.loading= false; */
            }}
          ></bim-button>
        `;
      });
  
      const filterButton = BUI.Component.create(() => {
        return BUI.html`
          <bim-button 
            label="Filter" 
            @click=${({ target }: { target: Button }) => {
              target.loading= true;
              
              pieChart.filterByValue((entry) => {
                if (!("value" in entry)) return false;
  
                return entry.value > 100;
              });
  
              /* barChart.filterByValue((entry) => {
                if (!("value" in entry)) return false;
  
                return entry.value > 100;
              });
            
              target.loading = false; */
            }}
          ></bim-button>
        `;
      });
  
      const resetButton = BUI.Component.create(() => {
        return BUI.html`
          <bim-button 
            label="Reset" 
            @click=${({ target }: { target: Button }) => {
              target.loading= true;
  
              pieChart.reset();
              /* barChart.reset(); */
  
              target.loading = false;
            }}
          ></bim-button>
        `;
      });
  
      const chartPanel = BUI.Component.create(() => {
        return BUI.html`
          <bim-panel style="display: flex; flex-direction: column; height: 100%;">
            <bim-panel-section label="Attributes Pie Chart" icon="raphael:piechart" style="flex: 1;">
              ${pieChart}
            </bim-panel-section>

            <!-- TODO: add the bar chart -->

            <bim-panel-section label="Labels" icon="raphael:tag" style="flex: 0.1;">
            ${labels}
            </bim-panel-section>

            <bim-panel-section label="Actions" style="display: flex; flex-direction: column; gap: 1.5rem;">
              ${highlightButton}
              ${filterButton}
              ${resetButton}
            </bim-panel-section> 
          </bim-panel>`;
      });
      
      panelElement = chartPanel;
      if (containerElement) {
        containerElement.innerHTML = "";
        containerElement.appendChild(panelElement);
      }
    })();

    return () => {
      if (panelElement && containerElement?.contains(panelElement)) {
        containerElement.removeChild(panelElement);
      }

      abortController.abort();
      fragmentsManager.list.onItemSet.remove(modelSetHandler);
    };
  }, [components]);
  
  return (
    <div className="overflow-auto max-h-1/2" ref={panelContainerRef} />
  );
};
