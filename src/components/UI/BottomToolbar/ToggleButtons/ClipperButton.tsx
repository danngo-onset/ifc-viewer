import { ScissorsIcon } from "@radix-ui/react-icons";

import { BimComponent } from "@/domain/enums/BIM/BimComponent";

import { Clipper } from "@/components/BIM";

import { BottomToolbarButton } from ".";

export const ClipperButton = () => {
  return (
    <BottomToolbarButton
      componentKey={BimComponent.Clipper}
      componentNode={<Clipper />}
      tooltipMessage="Clipper"
      icon={<ScissorsIcon className="bottom-toolbar-icon" />}
    />
  );
};
