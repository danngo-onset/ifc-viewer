import { PanelHeader } from "@/components/ui/NavigationRailDrawer";
import { TwoDViews } from "@/components/bim";

export const ViewsPanel = () => (
  <>
    <PanelHeader title="Views" />

    <section className="flex-1 overflow-y-auto">
      <div className="nav-rail-drawer-panel">
        <TwoDViews />
      </div>
    </section>
  </>
);
