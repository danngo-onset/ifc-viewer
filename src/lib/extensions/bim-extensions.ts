import { SideDrawerPanel } from "@/domain/enums/SideDrawerPanel";

/** Class for static extension methods */
export default class BimExtensions {
  static isPanelActive(current: SideDrawerPanel, target: SideDrawerPanel) {
    return current === target;
  }
}
