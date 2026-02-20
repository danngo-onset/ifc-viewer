import { BimExtensions } from "@/lib/extensions/bim";

import { SideDrawerPanel } from "@/domain/enums/SideDrawerPanel";

import { Shadow } from "@/components/bim";
import { PanelHeader } from "@/components/ui/NavigationRailDrawer";

import type { Props } from ".";

export const SettingsPanel = ({ 
  activePanel, 
  callback
}: Props) => {
  if (!BimExtensions.isPanelActive(activePanel, SideDrawerPanel.Settings)) 
    return;

  return (
    <>
      <PanelHeader title="Settings" callback={callback} />

      <section className="flex-1 overflow-y-auto">
        <div className="nav-rail-drawer-panel">
          <Shadow />
        </div>
      </section>
    </>
  );
};
