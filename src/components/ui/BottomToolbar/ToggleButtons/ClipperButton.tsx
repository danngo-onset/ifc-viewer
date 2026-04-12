import { ScissorsIcon } from "@radix-ui/react-icons";

import { BimComponent } from "@/domain/enums/bim/BimComponent";

import { Clipper } from "@/components/bim";

import { BottomToolbarButton } from ".";

export const ClipperButton = () =>
  <BottomToolbarButton
    componentKey={BimComponent.Clipper}
    componentNode={<Clipper />}
    tooltipMessage="Clipper"
    icon={<ScissorsIcon className="bottom-toolbar-icon" />}
  />
