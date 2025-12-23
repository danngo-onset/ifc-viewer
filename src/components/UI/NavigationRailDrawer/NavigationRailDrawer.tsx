import { useState, useEffect, useRef } from "react";

import { SideDrawerPanel } from "@/domain/enums/SideDrawerPanel";

import { ModelInspectorPanelToggle, ModelInspectorPanel } from "./panels";

type Props = {
  readonly isLoading: boolean;
}

const RAIL_WIDTH = 48;

export const NavigationRailDrawer = ({ 
  isLoading 
}: Props) => {
  const [activePanel, setActivePanel] = useState<SideDrawerPanel>(SideDrawerPanel.None);
  const [panelWidth, setPanelWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);

  const isPanelOpen = activePanel !== SideDrawerPanel.None;

  const togglePanel = (panelId: SideDrawerPanel) => {
    setActivePanel(prev => prev === panelId ? SideDrawerPanel.None : panelId);
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
        <ModelInspectorPanelToggle 
          activePanel={activePanel} 
          callback={() => togglePanel(SideDrawerPanel.ModelInspector)} 
        />

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
        <ModelInspectorPanel 
          activePanel={activePanel} 
          callback={() => setActivePanel(SideDrawerPanel.None)} 
          isLoading={isLoading} 
        />

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
