import { CubeIcon } from "@radix-ui/react-icons";

import { BimComponent } from "@/domain/enums/bim/BimComponent";

import { VolumeMeasurer } from "@/components/bim";

import { BottomToolbarButton } from ".";

export const VolumeMeasurerButton = () =>
  <BottomToolbarButton
    componentKey={BimComponent.VolumeMeasurer}
    componentNode={<VolumeMeasurer />}
    tooltipMessage="Volume Measurer"
    icon={<CubeIcon className="bottom-toolbar-icon" />}
  />
