import { useState, useEffect, useRef } from "react";

import { HamburgerMenuIcon } from "@radix-ui/react-icons";

import { ItemInspector } from "@/components/BIM";

import { CrossButton } from "./buttons";

type SideDrawerProps = {
  isLoading: boolean;
}

export const RightDrawer = ({ isLoading }: SideDrawerProps) => {
  const [open, setOpen] = useState(false);
  const [width, setWidth] = useState(320); // Default width: w-80 = 320px
  const [isResizing, setIsResizing] = useState(false);
  const drawerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isResizing) return;

    // Disable text selection and set cursor during resize
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";

    const abortController = new AbortController();

    document.addEventListener(
      "mousemove", 
      e => {
        e.preventDefault();
        const newWidth = window.innerWidth - e.clientX;
        const minWidth = 200;
        const maxWidth = window.innerWidth * 0.9;
        setWidth(Math.max(minWidth, Math.min(maxWidth, newWidth)));
      }, 
      { signal: abortController.signal }
    );

    document.addEventListener(
      "mouseup", 
      () => {
        setIsResizing(false);
        document.body.style.userSelect = "";
        document.body.style.cursor = "";
      }, 
      { signal: abortController.signal }
    );

    return () => {
      abortController.abort();
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
  }, [isResizing]);

  return (
    <>
      {!open && (
        <button
          className="fixed top-4 right-4 z-1000 rounded p-2 bg-white/80 hover:bg-white shadow cursor-pointer"
          onClick={() => setOpen(true)}
        >
          <HamburgerMenuIcon />
        </button>
      )}

      <aside
        ref={drawerRef}
        id="right-drawer-container"
        className="flex flex-col fixed inset-y-0 right-0 z-1000 h-full bg-white shadow-xl border-l transform transition-transform duration-300 overflow-hidden"
        data-open={open}
        style={{ width: `${width}px` }}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <CrossButton onClick={() => setOpen(false)} />

          <p className="text-sm font-medium">Menu</p>
        </div>

        {/* Resize handler */}
        {open && (
          <span
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsResizing(true);
            }}
            className="resize-handler"
          />
        )}

        <div className="flex-1 overflow-y-auto">
          <section className="p-4 text-sm text-gray-600 flex flex-col gap-4 h-full">
            <ItemInspector isLoading={isLoading} />
          </section>
        </div>
      </aside>
    </>
  );
};
