import { PanelHeader } from "@/components/ui/NavigationRailDrawer";
import { Shadow, Grids } from "@/components/bim";

export const SettingsPanel = () => (
  <>
    <PanelHeader title="Settings" />

    <section className="flex-1 overflow-y-auto">
      <div className="nav-rail-drawer-panel">
        <Shadow />
        
        <Grids />
      </div>
    </section>
  </>
);
