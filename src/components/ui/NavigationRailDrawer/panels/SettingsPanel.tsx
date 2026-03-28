import { PanelHeader } from "@/components/ui/NavigationRailDrawer";
import { ShadowToggle, Grids } from "@/components/bim";

export const SettingsPanel = () => (
  <>
    <PanelHeader title="Settings" />

    <section className="flex-1 overflow-y-auto">
      <div className="nav-rail-drawer-panel">
        <ShadowToggle />
        
        <Grids />
      </div>
    </section>
  </>
);
