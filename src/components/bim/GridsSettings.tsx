import { useState, useEffect, type ChangeEvent } from "react";

import type { ItemData } from "@thatopen/fragments";

import { useBimStoreShallow } from "@/store";

import { useBimComponent } from "@/hooks/bim";

import { BimComponent } from "@/domain/enums/bim";

import { SwitchButton } from "@/components/ui/buttons";

export const GridsSettings = () => {
  const { modelLoaded, selectedGridLevel, setSelectedGridLevel } = useBimStoreShallow(s => ({
    modelLoaded: s.modelLoaded,
    selectedGridLevel: s.selectedGridLevel,
    setSelectedGridLevel: s.setSelectedGridLevel
  }));

  const [gridsVisible, setGridsVisible] = useState(false);
  const [itemsData, setItemsData] = useState<ItemData[]>([]);

  const fragmentsManager = useBimComponent(BimComponent.FragmentsManager);
  const grids = useBimComponent(BimComponent.Grids);

  useEffect(() => {
    if (!grids) return;

    setGridsVisible(grids.visible);
  }, [grids]);

  useEffect(() => {
    if (!fragmentsManager) return;

    const [model] = fragmentsManager.list.values();
    if (!model) return;

    (async () => {
      const storeys = await model.getItemsOfCategories([/BUILDINGSTOREY/]);
      const localIds = Object.values(storeys).flat();

      const data = await model.getItemsData(localIds);
      setItemsData(data);
    })();
  }, [fragmentsManager, modelLoaded]);

  const getStoreyElevation = async (name: string) => {
    if (!fragmentsManager) return 0;

    const [model] = fragmentsManager.list.values();
    if (!model) return 0;
    
    const storey = itemsData.find(attribute => "Name" in attribute
                                            && "value" in attribute.Name
                                            && attribute.Name.value === name);

    if (!storey
     || !("Elevation" in storey && "value" in storey.Elevation)) {
      return 0;
    }

    const [, coordHeight] = await model.getCoordinates();
    return storey.Elevation.value as number + coordHeight;
  };

  const onGridLevelChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    if (!grids) return;

    const level = e.target.value;
    if (!level) return;

    setSelectedGridLevel(level);

    const elevation = await getStoreyElevation(level);
    grids.three.position.setY(elevation);
  };

  return (
    <div className="flex flex-col space-y-3">
      <div>
        <label htmlFor="grid-enabled">Grids visible</label>

        <SwitchButton
          id="grid-enabled"
          checked={gridsVisible}
          onClick={() => {
            if (!grids) return;

            grids.visible = !grids.visible;
            setGridsVisible(grids.visible);
          }}
          colour="blue-400"
        />
      </div>

      <div className="flex items-center gap-2">
        <label className="cursor-pointer" htmlFor="grid-level">Grid level</label>

        { modelLoaded 
          ? <select 
              id="grid-level" 
              value={selectedGridLevel}
              onChange={e => onGridLevelChange(e)}
              className="rounded border border-gray-400 p-1 w-28 cursor-pointer"
            >
              {itemsData.map(attribute => {
                if (!("Name" in attribute && "value" in attribute.Name))
                  return;

                const value = attribute.Name.value;

                return (
                  <option key={value.toString()} value={value}>
                    {value}
                  </option>
                );
              })}
            </select>
          : <p>Load a model to select a grid level</p>
        }
      </div>
    </div>
  );
};
