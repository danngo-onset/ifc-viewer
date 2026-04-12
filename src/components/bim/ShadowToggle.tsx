import { useEffect, useState } from "react";

import { useBimComponent } from "@/hooks/bim";

import { BimComponent } from "@/domain/enums/bim";

import { SwitchButton } from "@/components/ui/buttons";

export const ShadowToggle = () => {
  const [shadowVisible, setShadowVisible] = useState(false);

  const world = useBimComponent(BimComponent.World);

  useEffect(() => {
    if (!world) return;

    setShadowVisible(world.scene.shadowsEnabled);
  }, [world]);

  return (
    <div>
      <label htmlFor="shadow-visible" className="cursor-pointer">Shadow visible</label>

      <SwitchButton 
        id="shadow-visible"
        checked={shadowVisible}
        onClick={async () => {
          if (!world) return;
      
          world.scene.shadowsEnabled = !world.scene.shadowsEnabled;
          await world.scene.updateShadows();
          setShadowVisible(world.scene.shadowsEnabled);
        }}
        colour="blue-400"
      />
    </div>
  );
};
