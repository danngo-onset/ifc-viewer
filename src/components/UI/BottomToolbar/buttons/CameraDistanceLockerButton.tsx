import { useEffect, useState } from "react";

import { useBimComponent } from "@/hooks/BIM";

import { BimComponent } from "@/domain/enums/BIM/BimComponent";

import { WithTooltip } from "@/components/UI";
import { IconCamera } from "@/components/UI/icons";

export const CameraDistanceLockerButton = () => {
  const [cameraDistanceLockEnabled, setCameraDistanceEnabled] = useState(false);

  const cameraDistanceLocker = useBimComponent(BimComponent.CameraDistanceLocker);

  useEffect(() => {
    if (cameraDistanceLocker) {
      setCameraDistanceEnabled(cameraDistanceLocker.enabled);
    }
  }, [cameraDistanceLocker]);

  return (
    <WithTooltip message="Lock Camera Distance">
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
