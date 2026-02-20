import { RulerSquareIcon } from "@radix-ui/react-icons";

import { BimComponent } from "@/domain/enums/bim/BimComponent";

import { AreaMeasurer } from "@/components/bim";

import { BottomToolbarButton } from ".";

export const AreaMeasurerButton = () => (
  <BottomToolbarButton
    componentKey={BimComponent.AreaMeasurer}
    componentNode={<AreaMeasurer />}
    tooltipMessage="Area Measurer"
    icon={<RulerSquareIcon className="bottom-toolbar-icon" />}
  />
);
