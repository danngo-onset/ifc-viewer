import { RulerHorizontalIcon } from "@radix-ui/react-icons";

import { BimComponent } from "@/domain/enums/bim/BimComponent";

import { LengthMeasurer } from "@/components/bim";

import { BottomToolbarButton } from ".";

export const LengthMeasurerButton = () =>
  <BottomToolbarButton
    componentKey={BimComponent.LengthMeasurer}
    componentNode={<LengthMeasurer />}
    tooltipMessage="Length Measurer"
    icon={<RulerHorizontalIcon className="bottom-toolbar-icon" />}
  />
