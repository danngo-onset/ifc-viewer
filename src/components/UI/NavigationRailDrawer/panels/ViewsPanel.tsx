import { BimExtensions } from "@/lib/extensions/BIM";

import { SideDrawerPanel } from "@/domain/enums/SideDrawerPanel";

import { Views } from "@/components/BIM";
import { PanelHeader } from "@/components/UI/NavigationRailDrawer";

import type { Props } from ".";

export const ViewsPanel = ({ activePanel, callback }: Props) => {
  if (!BimExtensions.isPanelActive(activePanel, SideDrawerPanel.Views)) return null;

  return (
    <>
      <PanelHeader title="Views" callback={callback} />

      <section className="flex-1 overflow-y-auto">
        <div className="p-4 text-sm text-gray-600 flex flex-col gap-4 h-full">
          <Views />
        </div>
      </section>
    </>
  );
};
