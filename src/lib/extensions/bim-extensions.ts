import { SideDrawerPanel } from "@/domain/enums/SideDrawerPanel";

/** Class for static extension methods */
export default class BimExtensions {
  static isPanelActive(panel: SideDrawerPanel) {
    return panel === SideDrawerPanel.ModelInspector;
  }
}
