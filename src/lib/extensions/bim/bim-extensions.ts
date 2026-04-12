import type { BIMMaterial } from "@thatopen/fragments";

/** Class for static extension methods */
export class BimExtensions {
  static async initBUI() {
    const [
      { Manager: BUIManager },
      { Manager: BUICManager }
    ] = await Promise.all([
      import("@thatopen/ui"),
      import("@thatopen/ui-obc")
    ]);
    
    BUIManager.init();
    BUICManager.init();
  }

  static applyGhostTintToMaterials(materials: BIMMaterial[], darkSceneEnabled: boolean) {
    const ghostColour = darkSceneEnabled ? "White" : "Black";

    for (const material of materials) {
      if (
        material.userData.customId
     || !material.transparent 
     || material.opacity !== 0.1
      ) continue;
      
      material.needsUpdate = true;

      if ("color" in material) {
        material.color.setColorName(ghostColour);
      } else {
        material.lodColor.setColorName(ghostColour);
      }
    }
  }
};
