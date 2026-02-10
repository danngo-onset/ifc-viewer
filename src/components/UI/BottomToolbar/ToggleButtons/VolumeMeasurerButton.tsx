import { CubeIcon } from "@radix-ui/react-icons";

import { BimComponent } from "@/domain/enums/BIM/BimComponent";

import { VolumeMeasurer } from "@/components/BIM";

import { BottomToolbarButton } from ".";

export const VolumeMeasurerButton = () => {
  return (
    <BottomToolbarButton
      componentKey={BimComponent.VolumeMeasurer}
      componentNode={<VolumeMeasurer />}
      tooltipMessage="Volume Measurer"
      icon={<CubeIcon className="bottom-toolbar-icon" />}
    />
  );
};
