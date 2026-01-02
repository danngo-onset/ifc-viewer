import { useState, useEffect, useRef } from "react";

import { LayersIcon } from "@radix-ui/react-icons";

import { SideDrawerPanel } from "@/domain/enums/SideDrawerPanel";

import { IconSitemap } from "@/components/UI/icons";

import { 
  PanelToggle,
  ModelInspectorPanel,
  ClassifierPanel
} from "./panels";

type Props = {
  isLoading: boolean;
};

const RAIL_WIDTH = 160;

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
      <nav 
        style={{ width: RAIL_WIDTH }}
        className="flex flex-col items-start h-full bg-gray-900 border-r border-gray-700 py-4 gap-2 px-2"
      >
        <PanelToggle
          activePanel={activePanel}
          targetPanel={SideDrawerPanel.ModelInspector}
          callback={() => togglePanel(SideDrawerPanel.ModelInspector)}
          title="Model Inspector"
          icon={<LayersIcon />}
        />

        <PanelToggle
          activePanel={activePanel}
          targetPanel={SideDrawerPanel.Classifier}
          callback={() => togglePanel(SideDrawerPanel.Classifier)}
          title="Classify"
          icon={<IconSitemap />}
        />
      </nav>

      <aside
        ref={panelRef}
        className={`flex flex-col h-full bg-white shadow-xl border-r transform transition-all duration-300 overflow-hidden 
          ${isPanelOpen ? "opacity-100" : "opacity-0 pointer-events-none"}
        `}
        style={{ width: isPanelOpen ? `${panelWidth}px` : 0 }}
      >
        <ModelInspectorPanel 
          activePanel={activePanel} 
          callback={() => setActivePanel(SideDrawerPanel.None)} 
          isLoading={isLoading} 
        />

        <ClassifierPanel 
          activePanel={activePanel} 
          callback={() => setActivePanel(SideDrawerPanel.None)} 
        />

        {/* Resize handler */}
        {isPanelOpen && (
          <span
            onMouseDown={e => {
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
