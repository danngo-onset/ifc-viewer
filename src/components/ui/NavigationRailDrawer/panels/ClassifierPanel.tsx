import { PanelHeader } from "@/components/ui/NavigationRailDrawer";
import { Classifier } from "@/components/bim";

export const ClassifierPanel = () => <>
  <PanelHeader title="Classify" />

  <section className="flex-1 overflow-y-auto">
    <div className="nav-rail-drawer-panel">
      <Classifier />
    </div>
  </section>
</>
