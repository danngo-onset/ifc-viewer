import type * as OBCF from "@thatopen/components-front";

import useBimComponent from "@/hooks/useBimComponent";

import Constants from "@/domain/Constants";

export const Highlighter = () => {
  const highlighter = useBimComponent<OBCF.Highlighter>(Constants.HighlighterKey);
  
  return (
    <section
      className="w-64 bim-component-container"
    >
      <ul className="bim-component-guide">
        <li>Click to highlight</li>
        <li>CTRL + Click to highlight multiple (or unhighlight an item)</li>
      </ul>

      <button 
        className="btn-gray"
        onClick={() => highlighter?.clear()}
      >
        Delete all
      </button>
    </section>
  );
};
