import { AngleIcon } from "@radix-ui/react-icons";

import { BimComponent } from "@/domain/enums/bim/BimComponent";

import { AngleMeasurer } from "@/components/bim";

import { BottomToolbarButton } from ".";

export const AngleMeasurerButton = () =>
  <BottomToolbarButton
    componentKey={BimComponent.AngleMeasurer}
    componentNode={<AngleMeasurer />}
    tooltipMessage="Angle Measurer"
    icon={<AngleIcon className="bottom-toolbar-icon" />}
  />
