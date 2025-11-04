import { useState, useEffect, useRef } from "react";

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
  const [width, setWidth] = useState(320); // Default width: w-80 = 320px
  const [isResizing, setIsResizing] = useState(false);
  const drawerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      const newWidth = e.clientX;
      const minWidth = 200;
      const maxWidth = window.innerWidth * 0.9;
      setWidth(Math.max(minWidth, Math.min(maxWidth, newWidth)));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };

    // Disable text selection and set cursor during resize
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
  }, [isResizing]);

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
        ref={drawerRef}
        className={`flex flex-col fixed inset-y-0 left-0 z-[1000] h-full overflow-y-auto bg-white shadow-xl border-r transform transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ width: `${width}px` }}
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

        {/* Resize handle */}
        {open && (
          <div
            className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500 active:bg-blue-600 transition-colors z-10"
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsResizing(true);
            }}
          />
        )}

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
