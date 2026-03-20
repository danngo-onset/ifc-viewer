import { PanelHeader } from "@/components/ui/NavigationRailDrawer";
import { ModelInspector, ModelAttributes } from "@/components/bim";

export const ModelInspectorPanel = () => (
  <>
    <PanelHeader title="Model Inspector" />

    <section className="flex-1 overflow-y-auto">
      <div className="nav-rail-drawer-panel">
        <ModelInspector />
        
        <ModelAttributes />
      </div>
    </section>
  </>
);
