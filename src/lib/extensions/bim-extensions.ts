import type { SpatialTreeItem } from "@thatopen/fragments";

export default class BimExtensions {
  /** Helper function to check if a node or its children match the search term */
  static nodeMatchesSearch(item: SpatialTreeItem, searchTerm: string) : boolean {
    if (!searchTerm) return false;
    
    const term = searchTerm.toLowerCase();
    const displayName = (item.category || `Item ${item.localId ?? "Unknown"}`).toLowerCase();
    const localIdStr = item.localId?.toString().toLowerCase() || "";
    
    if (displayName.includes(term) || localIdStr.includes(term)) {
      return true;
    }
    
    // Check children recursively
    if (item.children) {
      return item.children.some(child => BimExtensions.nodeMatchesSearch(child, searchTerm));
    }
    
    return false;
  }
}
