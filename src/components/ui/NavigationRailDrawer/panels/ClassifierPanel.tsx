import { BimExtensions } from "@/lib/extensions/bim";

import { SideDrawerPanel } from "@/domain/enums/SideDrawerPanel";

import { Classifier } from "@/components/bim";
import { PanelHeader } from "@/components/ui/NavigationRailDrawer";

import type { Props } from ".";

export const ClassifierPanel = ({ activePanel, callback }: Props) => {
  if (!BimExtensions.isPanelActive(activePanel, SideDrawerPanel.Classifier))
    return;

  return (
    <>
      <PanelHeader title="Classify" callback={callback} />

      <section className="flex-1 overflow-y-auto">
        <div className="nav-rail-drawer-panel">
          <Classifier />
        </div>
      </section>
    </>
  );
};
