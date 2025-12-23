import { useState, useEffect, useRef } from "react";

import { LayersIcon, Cross1Icon } from "@radix-ui/react-icons";

import { ItemInspector, ModelInspector } from "@/components/BIM";

type PanelId = "model" | null;

type SideDrawerProps = {
  readonly isLoading: boolean;
}

const RAIL_WIDTH = 48;

export const SideDrawer = ({ 
  isLoading 
}: SideDrawerProps) => {
  const [activePanel, setActivePanel] = useState<PanelId>(null);
  const [panelWidth, setPanelWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const isPanelOpen = activePanel !== null;

  const togglePanel = (panelId: PanelId) => {
    setActivePanel(prev => prev === panelId ? null : panelId);
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      // Account for rail width when calculating panel width
      const newWidth = e.clientX - RAIL_WIDTH;
      const minWidth = 200;
      const maxWidth = window.innerWidth * 0.7;
      setPanelWidth(Math.max(minWidth, Math.min(maxWidth, newWidth)));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };

    // Disable text selection and set cursor during resize
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";

    const abortController = new AbortController();

    document.addEventListener("mousemove", handleMouseMove, { signal: abortController.signal });
    document.addEventListener("mouseup", handleMouseUp, { signal: abortController.signal });

    return () => {
      abortController.abort();
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
  }, [isResizing]);

  return (
    <article className="fixed inset-y-0 left-0 z-1000 flex">
      {/* Navigation Rail - always visible */}
      <nav className="flex flex-col items-center w-12 h-full bg-gray-900 border-r border-gray-700 py-4 gap-2">
        <button
          onClick={() => togglePanel("model")}
          className={`p-3 rounded-lg transition-colors ${
            activePanel === "model"
              ? "bg-blue-600 text-white"
              : "text-gray-400 hover:bg-gray-800 hover:text-white"
          }`}
        >
          <LayersIcon className="w-5 h-5" />
        </button>

        {/* Add more navigation items here */}
      </nav>

      {/* Expandable Panel */}
      <aside
        ref={panelRef}
        className={`flex flex-col h-full bg-white shadow-xl border-r transform transition-all duration-300 overflow-hidden ${
          isPanelOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        style={{ width: isPanelOpen ? `${panelWidth}px` : 0 }}
      >
        {/* Panel Header */}
        <section className="flex items-center justify-between p-4 border-b bg-gray-50">
          <h2 className="text-sm font-semibold text-gray-700">
            {activePanel === "model" && "Model Inspector"}
          </h2>

          <button
            onClick={() => setActivePanel(null)}
            className="p-1.5 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <Cross1Icon className="w-4 h-4" />
          </button>
        </section>

        {/* Panel Content */}
        <section className="flex-1 overflow-y-auto">
          {activePanel === "model" && (
            <div className="p-4 text-sm text-gray-600 flex flex-col gap-4 h-full">
              <ModelInspector isLoading={isLoading} />

              <ItemInspector isLoading={isLoading} />
            </div>
          )}
        </section>

        {/* Resize handler */}
        {isPanelOpen && (
          <span
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsResizing(true);
            }}
            className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500 active:bg-blue-600 transition-colors z-10"
            style={{ left: `${RAIL_WIDTH + panelWidth - 4}px` }}
          />
        )}
      </aside>
    </article>
  );
};
