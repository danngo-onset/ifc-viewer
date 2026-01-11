import { RulerHorizontalIcon } from "@radix-ui/react-icons";

import { BimComponent } from "@/domain/enums/BIM/BimComponent";

import { LengthMeasurer } from "@/components/BIM";

import { BottomToolbarButton } from ".";

export const LengthMeasurerButton = () => {
  return (
    <BottomToolbarButton
      componentKey={BimComponent.LengthMeasurer}
      componentNode={<LengthMeasurer />}
      tooltipMessage="Length Measurer"
      icon={<RulerHorizontalIcon className="bottom-toolbar-icon" />}
    />
  );
};
