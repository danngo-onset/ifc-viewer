import { useBimComponent } from "@/hooks/BIM";

import { BimComponent } from "@/domain/enums/BIM/BimComponent";

export const Highlighter = () => {
  const highlighter = useBimComponent(BimComponent.Highlighter);
  
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
        Delete All
      </button>
    </section>
  );
};
