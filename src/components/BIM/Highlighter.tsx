import type * as OBF from "@thatopen/components-front";

import useBimComponent from "@/hooks/useBimComponent";

import Constants from "@/domain/Constants";

export const Highlighter = () => {
  const highlighter = useBimComponent<OBF.Highlighter>(Constants.HighlighterKey);
  
  return (
    <section
      className="w-48 flex flex-col space-y-3 absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-white border border-gray-300 rounded-lg shadow-lg p-4 *:text-sm *:flex *:items-center *:justify-between"
    >
      <ul className="flex-col items-start! list-disc list-inside">
        <li>Click to highlight</li>
        <li>CTRL + Click to highlight multiple</li>
      </ul>

      <button 
        className="button-gray"
        onClick={() => highlighter?.clear()}
      >
        Delete all
      </button>
    </section>
  );
};
