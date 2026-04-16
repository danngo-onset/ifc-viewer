import { useBimComponent } from "@/hooks/bim";

import { BimComponent } from "@/domain/enums/bim/BimComponent";

import { WithTooltip } from "@/components/ui";
import { IconCamera } from "@/components/ui/icons";

export const CameraDistanceLockerButton = () => {
  const [cameraDistanceLocker, mutateCameraDistanceLocker] = useBimComponent(BimComponent.CameraDistanceLocker);
  
  const enabled = cameraDistanceLocker?.enabled ?? false;

  return <WithTooltip message="Lock Camera Distance" position="top">
    <button
      onClick={() => mutateCameraDistanceLocker(x => x.enabled = !enabled)}
      className="button-toolbar-button"
      data-active={enabled}
    >
      <IconCamera classes="bottom-toolbar-icon" />
    </button>
  </WithTooltip>
};
