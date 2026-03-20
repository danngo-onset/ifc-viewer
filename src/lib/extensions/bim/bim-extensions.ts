/** Class for static extension methods */
export class BimExtensions {
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
