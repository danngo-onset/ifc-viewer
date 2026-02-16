import { useEffect, useState } from "react";

import { useBimComponent } from "@/hooks/BIM";

import { BimComponent } from "@/domain/enums/BIM";

import { SwitchButton } from "@/components/UI/buttons";

// TODO: not working
export const Shadow = () => {
  const [shadowsEnabled, setShadowsEnabled] = useState(false);

  const world = useBimComponent(BimComponent.World);

  useEffect(() => {
    if (!world) return;

    setShadowsEnabled(world.scene.shadowsEnabled);
  }, [world?.scene.shadowsEnabled]);

  return (
    <div>
      <label htmlFor="shadows-enabled" className="cursor-pointer">Shadows enabled</label>

      <SwitchButton 
        id="shadows-enabled"
        checked={shadowsEnabled}
        onClick={async () => {
          if (!world) return;
      
          //console.log(world.scene.shadowsEnabled);
          world.scene.shadowsEnabled = !world.scene.shadowsEnabled;
          await world.scene.updateShadows();
          setShadowsEnabled(world.scene.shadowsEnabled);
          //console.log(world.scene.shadowsEnabled);
        }}
        colour="blue-400"
      />
    </div>
  );
};
