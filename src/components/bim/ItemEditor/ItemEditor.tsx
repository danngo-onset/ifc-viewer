import { useRef } from "react";

import { Component, PanelSection, html } from "@thatopen/ui";

import { Color } from "three";

import { useBimComponent } from "@/hooks/bim";

import { BimComponent } from "@/domain/enums/bim/BimComponent";

export const ItemEditor = () => {
  const panelContainerRef = useRef<HTMLDivElement>(null);

  const [generalEditor] = useBimComponent(BimComponent.GeneralEditor);
  const [fragmentsManager] = useBimComponent(BimComponent.FragmentsManager);

  const model = fragmentsManager.core.models.list.values().toArray()[0];

  const [samplesPanel, updateSamplesPanel] = Component.create<PanelSection, any>(() => {
    const tempColour = new Color();

    const samplesMenus: PanelSection[] = [];

    if (generalEditor.elementSelected) {
      const samples = generalEditor.samples;
      for (const id in samples) {
        const sample = samples[id];
        const materialMenu = Component.create<PanelSection>(() => html`
          <bim-dropdown 
            label="Material" 
            @change=${async (e: any) => {
              if (!e.target.value[0]) return;

              const idNum = parseInt(id, 10);
              await generalEditor.setSampleMaterial(idNum, e.target.value[0]);
            }}
          ></bim-dropdown>
        `);

        generalEditor.updateMaterials(model).then(() => {
          for (const [materialId, material] of generalEditor.materials) {
            const { r, g, b } = material;
            tempColour.setRGB(r / 255, g / 255, b / 255);
            const colourString = `#${tempColour.getHexString()}`;

            const option = Component.create<PanelSection>(() => html`
              <bim-option 
                icon="icon-park-outline:material" 
                label=${materialId} 
                ?checked=${sample.material === materialId}
              >
                <div style="width: 1rem; height: 1rem; background-color: ${colourString}"></div>
              </bim-option>
            `);

            materialMenu.append(option);
          }
        });

        const sampleMenu = Component.create<PanelSection>(() => html`
          <div style="display: flex; gap: 0.5rem; flex-direction: column;">
            <div style="display: flex; gap: 0.5rem;">
              <bim-label icon="f7:cube" style="font-weight: bold;">Sample ${id}</bim-label>
            </div>

            ${materialMenu}

            <bim-dropdown label="Local Transform" @change=${async (e: any) => {
              if (!e.target.value[0]) return;

              const sample = samples[id];
              if (!sample) return;

              sample.localTransform = e.target.value[0];
              await generalEditor.updateSamples();
            }}>
              ${[
                ...new Set([
                  ...generalEditor.localTransformIds,
                  sample.localTransform,
                ]),
              ].map(ltId => html`
                <bim-option 
                  icon="iconoir:axes" 
                  label=${ltId} 
                  ?checked=${sample.localTransform === ltId}>
                </bim-option>
              `)}
            </bim-dropdown>

            <bim-dropdown label="Geometry" @change=${async (e: any) => {
              if (!e.target.value[0]) return;

              const sample = samples[id];
              if (!sample) return;

              sample.representation = e.target.value[0];
              await generalEditor.updateSamples();
            }}>
              ${[
                ...new Set([
                  ...generalEditor.geometryIds,
                  sample.representation,
                ]),
              ].map(geometryId => html`
                <bim-option 
                  icon="fluent:select-object-24-filled" 
                  label=${geometryId} 
                  ?checked=${sample.representation === geometryId}
                ></bim-option>
              `)}
            </bim-dropdown>
          </div>
        `);

        samplesMenus.push(sampleMenu);
      }
    }

    return html`
      <bim-panel-section label="Samples">
        ${samplesMenus.map((menu) => menu)}
      </bim-panel-section>
    `;
  }, {});

  const [matsPanel, updateMatsPanel] = Component.create<PanelSection, any>(() => {
    const materials = generalEditor.get3dMaterials();

    return html`
      <div style="display: flex; flex-direction: column; gap: 0.5rem;">
        ${materials.map(material => html`
          <div style="display: flex; gap: 0.5rem;">
            <bim-color-input 
              color=#${material.color.getHexString()} 
              label=${material.userData.localId} 
              @input=${(e: any) => {
                material.color.set(e.target.color);
              }}>
            </bim-color-input>

            <bim-number-input 
              slider
              min=0 
              max=1 
              step=0.01 
              value=${material.opacity} 
              @change=${(e: any) => {
                material.opacity = e.target.value;
              }}>
            </bim-number-input>
          </div>
        `)}
      </div>
    `;
  }, {});

  generalEditor.sampleMaterialsUpdated.add(updateMatsPanel);

  return <div className="overflow-auto" ref={panelContainerRef} />
};
