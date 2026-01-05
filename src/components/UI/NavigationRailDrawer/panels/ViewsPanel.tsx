import { Cross1Icon } from "@radix-ui/react-icons";

import { BimExtensions } from "@/lib/extensions/BIM";

import { SideDrawerPanel } from "@/domain/enums/SideDrawerPanel";

import { Views } from "@/components/BIM";

import type { Props } from ".";

export const ViewsPanel = ({ activePanel, callback }: Props) => {
  if (!BimExtensions.isPanelActive(activePanel, SideDrawerPanel.Views)) return null;

  return (
    <>
      <section className="flex items-center justify-between p-4 border-b bg-gray-50">
        <h2 className="text-sm font-semibold text-gray-700">
          Views
        </h2>

        <button
          onClick={callback}
          className="p-1.5 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <Cross1Icon className="w-4 h-4" />
        </button>
      </section>

      <section className="flex-1 overflow-y-auto">
        <div className="p-4 text-sm text-gray-600 flex flex-col gap-4 h-full">
          <Views />
        </div>
      </section>
    </>
  );
};
