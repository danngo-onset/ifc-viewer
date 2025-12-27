import { SideDrawerPanel } from "@/domain/enums/SideDrawerPanel";

/** Class for static extension methods */
export class BimExtensions {
  static isPanelActive(current: SideDrawerPanel, target: SideDrawerPanel) {
    return current === target;
  }
};
