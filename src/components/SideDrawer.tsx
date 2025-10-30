import { useEffect, useState } from "react";

import type * as OBF from "@thatopen/components-front";

import { HamburgerMenuIcon, Cross1Icon } from "@radix-ui/react-icons";

import AreaMeasurer from "./BIM/AreaMeasurer";
import LengthMeasurer from "./BIM/LengthMeasurer";

import useBimComponent from "@/hooks/useBimComponent";

import Constants from "@/domain/Constants";
import type { OrbitLockToggle } from "@/domain/types/OrbitLockToggle";

type SideDrawerProps = {
  readonly isLoading: boolean;
}
export default function SideDrawer({ 
  isLoading 
}: SideDrawerProps) {
  const [open, setOpen] = useState(false);
  
  const orbitToggle = useBimComponent<OrbitLockToggle>(Constants.OrbitLockKey);
  const [orbitLock, setOrbitLock] = useState(false);
  useEffect(() => {
    if (orbitToggle) setOrbitLock(orbitToggle.enabled);
  }, [orbitToggle]);

  const highlighter = useBimComponent<OBF.Highlighter>(Constants.HighlighterKey);
  const [highlighterEnabled, setHighlighterEnabled] = useState(false);
  useEffect(() => {
    if (highlighter) setHighlighterEnabled(highlighter.enabled);
  }, [highlighter]);

  return (
    <>
      {!open && (
        <button
          className="fixed top-4 left-4 z-[1000] rounded p-2 bg-white/80 hover:bg-white shadow cursor-pointer"
          onClick={() => setOpen(true)}
        >
          <HamburgerMenuIcon />
        </button>
      )}

      <aside
        className={`flex flex-col fixed inset-y-0 left-0 z-[1000] h-full w-80 max-w-[90vw] overflow-y-auto bg-white shadow-xl border-r transform transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <button
            onClick={() => setOpen(false)}
            className="rounded p-2 hover:bg-gray-100"
          >
            <Cross1Icon />
          </button>

          <p className="text-sm font-medium">Menu</p>
        </div>

        <section className="p-4 text-sm text-gray-600 flex flex-col gap-4">
          <AreaMeasurer />

          <LengthMeasurer />

          <span className="flex items-center space-x-2 text-sm">
            <input
              id="highlighter-enabled"
              type="checkbox"
              checked={highlighterEnabled}
              disabled={isLoading || !highlighter}
              onChange={(e) => {
                if (!highlighter) return;

                setHighlighterEnabled(e.target.checked);
                highlighter.enabled = e.target.checked;
              }}
            />

            <label htmlFor="highlighter-enabled">Enable Highlighter</label>
          </span>

          <span className="flex items-center space-x-2 text-sm">
            <input
              id="orbit-lock-enabled"
              type="checkbox"
              checked={orbitLock}
              disabled={isLoading || !orbitToggle}
              onChange={(e) => {

                setOrbitLock(e.target.checked);
                orbitToggle?.setEnabled(e.target.checked);
              }}
            />

            <label htmlFor="orbit-lock-enabled">Enable Camera Orbit Lock</label>
          </span>
        </section>
      </aside>
    </>
  );
};
