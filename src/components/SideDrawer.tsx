import { useState } from "react";

import { HamburgerMenuIcon, Cross1Icon } from "@radix-ui/react-icons";

import AreaMeasurer from "./BIM/AreaMeasurer";
import LengthMeasurer from "./BIM/LengthMeasurer";
import Highlighter from "./BIM/Highlighter";
import CameraOrbitLock from "./BIM/CameraOrbitLock";
import ModelInspector from "./BIM/ModelInspector";

type SideDrawerProps = {
  readonly isLoading: boolean;
}
export default function SideDrawer({ 
  isLoading 
}: SideDrawerProps) {
  const [open, setOpen] = useState(false);

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
          <ModelInspector isLoading={isLoading} />

          <AreaMeasurer />

          <LengthMeasurer />

          <Highlighter isLoading={isLoading} />

          <CameraOrbitLock isLoading={isLoading} />
        </section>
      </aside>
    </>
  );
};
