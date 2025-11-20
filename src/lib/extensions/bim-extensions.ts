import type { SpatialTreeItem } from "@thatopen/fragments";

export default class BimExtensions {
  /** Check if this node matches (not its descendants) */
  static nodeMatchesSelf(item: SpatialTreeItem, searchQuery: string) {
    if (!searchQuery) return false;
    
    const query = searchQuery.toLowerCase();
    const displayName = (item.category || `Item ${item.localId ?? "Unknown"}`).toLowerCase();
    const localIdStr = item.localId?.toString().toLowerCase() || "";
    
    if (displayName.includes(query) || localIdStr.includes(query)) {
      return true;
    }

    return null;
  }

  /** Check if a node or its children match the search term */
  static nodeMatchesSearch(item: SpatialTreeItem, searchQuery: string): boolean {
    // Check if this node matches
    const matchesSelf = BimExtensions.nodeMatchesSelf(item, searchQuery);
    if (matchesSelf !== null) {
      return matchesSelf;
    }
    
    // Check children recursively
    if (item.children) {
      return item.children.some(
        child => BimExtensions.nodeMatchesSearch(child, searchQuery)
      );
    }
    
    return false;
  }
}
