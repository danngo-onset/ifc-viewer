import { PanelHeader } from "@/components/ui/NavigationRailDrawer";

import { ItemInspector } from "@/components/bim";

export const ItemInspectorPanel = () => <>
  <PanelHeader title="Item Inspector" />

  <section className="flex-1 overflow-y-auto">
    <div className="nav-rail-drawer-panel">
      <ItemInspector />
    </div>
  </section>
</>
