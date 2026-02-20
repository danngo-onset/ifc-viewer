import { SideDrawerPanel } from "@/domain/enums/SideDrawerPanel";

/** Class for static extension methods */
export class BimExtensions {
  static isPanelActive(current: SideDrawerPanel, target: SideDrawerPanel) {
    return current === target;
  }

  static async initBUI() {
    const [
      { Manager: BUIManager },
      { Manager: BUICManager }
    ] = await Promise.all([
      import("@thatopen/ui"),
      import("@thatopen/ui-obc")
    ]);
    
    BUIManager.init();
    BUICManager.init();
  }
};
