import { useState, useEffect, useRef, useMemo } from "react";

import { LayersIcon, StackIcon, EyeOpenIcon, GearIcon } from "@radix-ui/react-icons";

import { useUiStore } from "@/store";

import { SideDrawerPanel } from "@/domain/enums/SideDrawerPanel";

import { IconSitemap } from "@/components/ui/icons";

import { PanelToggle } from ".";

import { 
  ModelInspectorPanel, ClassifierPanel, ViewsPanel,
  SettingsPanel
} from "./panels";

const RAIL_WIDTH = 145;

const PANELS: {
  id        : SideDrawerPanel;
  title     : string;
  icon      : React.ReactElement;
  component : React.ReactElement;
}[] = [
  {
    id: SideDrawerPanel.Models,
    title: "Models",
    icon: <LayersIcon />,
    component: <></>
  },
  {
    id: SideDrawerPanel.ModelInspector,
    title: "Model Inspector",
    icon: <StackIcon />,
    component: <ModelInspectorPanel />
  },
  {
    id: SideDrawerPanel.Classifier,
    title: "Classifier",
    icon: <IconSitemap />,
    component: <ClassifierPanel />
  },
  {
    id: SideDrawerPanel.Views,
    title: "Views",
    icon: <EyeOpenIcon />,
    component: <ViewsPanel />
  },
  {
    id: SideDrawerPanel.Settings,
    title: "Settings",
    icon: <GearIcon />,
    component: <SettingsPanel />
  }
] as const;

export const NavigationRailDrawer = () => {
  const activeNavRailPanel = useUiStore(s => s.activeNavRailPanel);

  const [panelWidth, setPanelWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);

  const activePanel = useMemo(
    () => PANELS.find(panel => panel.id === activeNavRailPanel)?.component
  , [activeNavRailPanel]);

  const isPanelOpen = activeNavRailPanel !== SideDrawerPanel.None;

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
        // Account for rail width when calculating panel width
        const newWidth = e.clientX - RAIL_WIDTH;
        const minWidth = 200;
        const maxWidth = window.innerWidth * 0.7;
        setPanelWidth(Math.max(minWidth, Math.min(maxWidth, newWidth)));
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
    <article className="fixed inset-y-0 left-0 z-1000 flex">
      {/* Navigation Rail - always visible */}
      <nav 
        style={{ width: RAIL_WIDTH }}
        className="flex flex-col items-start h-full bg-gray-900 border-r border-gray-700 py-4 gap-2 px-2"
      >
        {PANELS.map(panel => (
          <PanelToggle 
            key={panel.id} 
            targetPanel={panel.id} 
            title={panel.title} 
            icon={panel.icon} 
          />
        ))}
      </nav>

      <aside
        ref={panelRef}
        id="navigation-rail-drawer-container"
        data-open={isPanelOpen}
        style={{ width: isPanelOpen ? `${panelWidth}px` : 0 }}
      >
        {activePanel}

        {/* Resize handler */}
        {isPanelOpen && (
          <span
            onMouseDown={e => {
              e.preventDefault();
              e.stopPropagation();
              setIsResizing(true);
            }}
            className="resize-handler"
            style={{ left: `${RAIL_WIDTH + panelWidth - 4}px` }}
          />
        )}
      </aside>
    </article>
  );
};
