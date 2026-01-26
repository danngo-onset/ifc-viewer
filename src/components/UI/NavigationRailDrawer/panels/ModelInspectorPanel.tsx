import { BimExtensions } from "@/lib/extensions/BIM";

import { SideDrawerPanel } from "@/domain/enums/SideDrawerPanel";

import { ModelInspector, ModelAttributes } from "@/components/BIM";
import { PanelHeader } from "@/components/UI/NavigationRailDrawer";

import type { Props } from ".";

interface PanelProps extends Props {
  isLoading: boolean;
};

export const ModelInspectorPanel = ({ 
  activePanel, 
  callback, 
  isLoading
}: PanelProps) => {
  if (!BimExtensions.isPanelActive(activePanel, SideDrawerPanel.ModelInspector)) return null;

  return (
    <>
      <PanelHeader title="Model Inspector" callback={callback} />

      <section className="flex-1 overflow-y-auto">
        <div className="p-4 text-sm text-gray-600 flex flex-col gap-4 h-full">
          <ModelInspector isLoading={isLoading} />
          
          <ModelAttributes />
        </div>
      </section>
    </>
  );
};
