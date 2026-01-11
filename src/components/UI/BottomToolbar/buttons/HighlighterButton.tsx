import { BimComponent } from "@/domain/enums/BIM/BimComponent";

import { Highlighter } from "@/components/BIM";
import { IconPaintRoller } from "@/components/UI/icons";

import { BottomToolbarButton } from ".";

export const HighlighterButton = () => {
  return (
    <BottomToolbarButton
      componentKey={BimComponent.Highlighter}
      componentNode={<Highlighter />}
      tooltipMessage="Highlighter"
      icon={<IconPaintRoller classes="bottom-toolbar-icon" />}
    />
  );
};
