import { BimExtensions } from "@/lib/extensions/bim";

import { SideDrawerPanel } from "@/domain/enums/SideDrawerPanel";

import { Views } from "@/components/bim";
import { PanelHeader } from "@/components/ui/NavigationRailDrawer";

import type { Props } from ".";

export const ViewsPanel = ({ activePanel, callback }: Props) => {
  if (!BimExtensions.isPanelActive(activePanel, SideDrawerPanel.Views))
    return;

  return (
    <>
      <PanelHeader title="Views" callback={callback} />

      <section className="flex-1 overflow-y-auto">
        <div className="nav-rail-drawer-panel">
          <Views />
        </div>
      </section>
    </>
  );
};
