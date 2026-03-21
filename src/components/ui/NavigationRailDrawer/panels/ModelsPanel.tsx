import { PanelHeader } from "@/components/ui/NavigationRailDrawer";
import { ModelsList } from "@/components/bim";

export const ModelsPanel = () => (
  <>
    <PanelHeader title="Models" />

    <section className="flex-1 overflow-y-auto">
      <div className="nav-rail-drawer-panel">
        <ModelsList />
      </div>
    </section>
  </>
);
