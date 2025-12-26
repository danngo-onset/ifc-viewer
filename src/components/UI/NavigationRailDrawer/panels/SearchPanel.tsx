import { MagnifyingGlassIcon, Cross1Icon } from "@radix-ui/react-icons";

import BimExtensions from "@/lib/extensions/bim-extensions";

import { SideDrawerPanel } from "@/domain/enums/SideDrawerPanel";

import { Classifier } from "@/components/BIM";

import type { Props } from "./";

const TITLE = "Classify";

export const SearchPanelToggle = ({ activePanel, callback }: Props) => {
  return (
    <button
      onClick={callback}
      className={`w-full p-2 rounded-lg transition-colors flex items-center gap-2 
        ${BimExtensions.isPanelActive(activePanel, SideDrawerPanel.Search) 
          ? "bg-blue-600 text-white"
          : "text-gray-400 hover:bg-gray-800 hover:text-white"}
      `}
    >
      <MagnifyingGlassIcon className="w-4 h-4" />

      <p className="text-xs">{TITLE}</p>
    </button>
  );
};

export const SearchPanel = ({ activePanel, callback }: Props) => {
  if (!BimExtensions.isPanelActive(activePanel, SideDrawerPanel.Search)) return null;

  return (
    <>
      <section className="flex items-center justify-between p-4 border-b bg-gray-50">
        <h2 className="text-sm font-semibold text-gray-700">
          {TITLE}
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
          <Classifier />
        </div>
      </section>
    </>
  );
};
