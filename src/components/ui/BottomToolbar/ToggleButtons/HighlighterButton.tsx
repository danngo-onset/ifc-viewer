import { BimComponent } from "@/domain/enums/bim/BimComponent";

import { Highlighter } from "@/components/bim";
import { IconPaintRoller } from "@/components/ui/icons";

import { BottomToolbarButton } from ".";

export const HighlighterButton = () =>
  <BottomToolbarButton
    componentKey={BimComponent.Highlighter}
    componentNode={<Highlighter />}
    tooltipMessage="Highlighter"
    icon={<IconPaintRoller classes="bottom-toolbar-icon" />}
  />
