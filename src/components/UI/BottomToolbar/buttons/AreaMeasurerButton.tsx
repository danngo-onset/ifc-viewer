import { RulerSquareIcon } from "@radix-ui/react-icons";

import { BimComponent } from "@/domain/enums/BIM/BimComponent";

import { AreaMeasurer } from "@/components/BIM";

import { BottomToolbarButton } from ".";

export const AreaMeasurerButton = () => {
  return (
    <BottomToolbarButton
      componentKey={BimComponent.AreaMeasurer}
      componentNode={<AreaMeasurer />}
      tooltipMessage="Area Measurer"
      icon={<RulerSquareIcon className="bottom-toolbar-icon" />}
    />
  );
};
