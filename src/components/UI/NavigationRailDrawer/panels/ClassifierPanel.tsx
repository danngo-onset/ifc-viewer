import { BimExtensions } from "@/lib/extensions/BIM";

import { SideDrawerPanel } from "@/domain/enums/SideDrawerPanel";

import { Classifier } from "@/components/BIM";
import { PanelHeader } from "@/components/UI/NavigationRailDrawer";

import type { Props } from ".";

export const ClassifierPanel = ({ activePanel, callback }: Props) => {
  if (!BimExtensions.isPanelActive(activePanel, SideDrawerPanel.Classifier)) return null;

  return (
    <>
      <PanelHeader title="Classify" callback={callback} />

      <section className="flex-1 overflow-y-auto">
        <div className="p-4 text-sm text-gray-600 flex flex-col gap-4 h-full">
          <Classifier />
        </div>
      </section>
    </>
  );
};
