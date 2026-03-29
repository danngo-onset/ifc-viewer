import type { BIMMaterial } from "@thatopen/fragments";

import { useBimStoreShallow } from "@/store/bimStore";

import { useBimComponent } from "@/hooks/bim";

import { BimComponent } from "@/domain/enums/bim";

import { SwitchButton } from "@/components/ui/buttons";

const originalColours = new Map<BIMMaterial, { colour: number; transparent: boolean; opacity: number }>();

export const GhostModeToggle = () => {
  const { ghostModeEnabled, setGhostModeEnabled } = useBimStoreShallow(s => ({
    ghostModeEnabled: s.ghostModeEnabled,
    setGhostModeEnabled: s.setGhostModeEnabled
  }));

  const fragmentsManager = useBimComponent(BimComponent.FragmentsManager);

  const setModelTransparent = () => {
    if (!fragmentsManager) return;

    const materials = [...fragmentsManager.core.models.materials.list.values()];

    for (const material of materials) {
      if (material.userData.customId)
        continue;

      // Save colours
      let colour: number;
      if ("color" in material) {
        colour = material.color.getHex();
      } else {
        colour = material.lodColor.getHex();
      }

      originalColours.set(material, {
        colour,
        transparent: material.transparent,
        opacity: material.opacity
      });

      // Set colour
      material.transparent = true;
      material.opacity = 0.1;
      material.needsUpdate = true;

      // TODO: handle ghost colour for dark mode (white)
      const ghostColour = "Black";
      if ("color" in material) {
        material.color.setColorName(ghostColour);
      } else {
        material.lodColor.setColorName(ghostColour);
      }
    }

    setGhostModeEnabled(true);
  };

  const restoreModelMaterials = () => {
    for (const [material, data] of originalColours) {
      const { colour, transparent, opacity } = data;
      
      material.transparent = transparent;
      material.opacity = opacity;

      if ("color" in material) {
        material.color.setHex(colour);
      } else {
        material.lodColor.setHex(colour);
      }

      material.needsUpdate = true;
    }

    originalColours.clear();

    setGhostModeEnabled(false);
  };
  
  return (
    <div>
      <label htmlFor="ghost-mode" className="cursor-pointer">Ghost Mode</label>

      <SwitchButton 
        id="ghost-mode"
        checked={ghostModeEnabled}
        onClick={() => {
          if (originalColours.size) {
            restoreModelMaterials();
          } else {
            setModelTransparent();
          }
        }}
        colour="blue-400"
      />
    </div>
  );
};
