import { useBimComponent } from "@/hooks/bim";

import { BimComponent } from "@/domain/enums/bim";

import { SwitchButton } from "@/components/ui/buttons";

export const ShadowToggle = () => {
  const [world, mutateWorld] = useBimComponent(BimComponent.World);
  const shadowVisible = world?.scene.shadowsEnabled ?? false;

  return (
    <div>
      <label htmlFor="shadow-visible" className="cursor-pointer">Shadow visible</label>

      <SwitchButton 
        id="shadow-visible"
        checked={shadowVisible}
        onClick={async () => {
          if (!world) return;
      
          const success = mutateWorld(x => x.scene.shadowsEnabled = !shadowVisible);
          if (!success) return;

          await world.scene.updateShadows();
        }}
        colour="blue-400"
      />
    </div>
  );
};
