import { useEffect, useState } from "react";

import { useBimComponent } from "@/hooks/bim";

import { BimComponent } from "@/domain/enums/bim/BimComponent";

import { WithTooltip } from "@/components/ui";
import { IconCamera } from "@/components/ui/icons";

export const CameraDistanceLockerButton = () => {
  const [cameraDistanceLockEnabled, setCameraDistanceEnabled] = useState(false);

  const cameraDistanceLocker = useBimComponent(BimComponent.CameraDistanceLocker);

  useEffect(() => {
    if (cameraDistanceLocker) {
      setCameraDistanceEnabled(cameraDistanceLocker.enabled);
    }
  }, [cameraDistanceLocker]);

  return (
    <WithTooltip message="Lock Camera Distance" position="top">
      <button
        onClick={() => {
          if (!cameraDistanceLocker) return;
          
          const newEnabled = !cameraDistanceLockEnabled;
          setCameraDistanceEnabled(newEnabled);
          cameraDistanceLocker.setEnabled(newEnabled);
        }}
        className="button-toolbar-button"
        data-active={cameraDistanceLockEnabled}
      >
        <IconCamera classes="bottom-toolbar-icon" />
      </button>
    </WithTooltip>
  );
};
