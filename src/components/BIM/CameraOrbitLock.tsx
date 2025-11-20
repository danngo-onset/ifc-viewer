import { useEffect, useState } from "react";

import useBimComponent from "@/hooks/useBimComponent";

import Constants from "@/domain/Constants";
import type { OrbitLockToggle } from "@/domain/types/OrbitLockToggle";

type CameraOrbitLockProps = {
  readonly isLoading: boolean;
}

export const CameraOrbitLock = ({ 
  isLoading 
}: CameraOrbitLockProps) => {
  const [orbitLockEnabled, setOrbitLockEnabled] = useState(false);

  const orbitToggle = useBimComponent<OrbitLockToggle>(Constants.OrbitLockKey);

  useEffect(() => {
    if (orbitToggle) setOrbitLockEnabled(orbitToggle.enabled);
  }, [orbitToggle]);

  return (
    <span className="flex items-center space-x-2 text-sm">
      <input
        id="orbit-lock-enabled"
        type="checkbox"
        checked={orbitLockEnabled}
        disabled={isLoading || !orbitToggle}
        onChange={(e) => {
          if (!orbitToggle) return;

          setOrbitLockEnabled(e.target.checked);
          orbitToggle.setEnabled(e.target.checked);
        }}
      />

      <label htmlFor="orbit-lock-enabled">Enable Camera Orbit Lock</label>
    </span>
  );
};
