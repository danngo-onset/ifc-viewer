import type { SpatialTreeItem } from "@thatopen/fragments";

/** Class for static extension methods */
export default class BimExtensions {
  /** Check if a node or its children match the search term */
  static nodeMatchesSearch(item: SpatialTreeItem, searchQuery: string): boolean {
    // Check if this node matches
    const matchesSelf = this.nodeMatchesSelf(item, searchQuery);
    if (matchesSelf !== null) {
      return matchesSelf;
    }
    
    // Check children recursively
    if (item.children) {
      return item.children.some(
        child => this.nodeMatchesSearch(child, searchQuery)
      );
    }
    
    return false;
  }

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

  /** Helper to collect local IDs from a node and its descendants */
  static collectLocalIds(item: SpatialTreeItem, accumulator: Set<number>) {
    if (item.localId !== null && item.localId !== undefined) {
      accumulator.add(item.localId);
    }
    
    if (item.children) {
      for (const child of item.children) this.collectLocalIds(child, accumulator);
    }
  }

  /** Find a node in the original tree by matching its properties */
  static findNodeInOriginalTree(tree: SpatialTreeItem, targetItem: SpatialTreeItem): SpatialTreeItem | null {
    // For nodes with localId, match by localId (most specific)
    if (
      targetItem.localId !== null
   && targetItem.localId !== undefined
    ) {
      if (tree.localId === targetItem.localId) {
        return tree;
      }
    } else {
      // For category nodes without localId, match by category
      if (
        tree.category === targetItem.category 
     && tree.localId === targetItem.localId
      ) {
        return tree;
      }
    }
    
    // Search in children
    if (tree.children) {
      for (const child of tree.children) {
        const found = this.findNodeInOriginalTree(child, targetItem);
        if (found) return found;
      }
    }
    
    return null;
  }

  /**
  * Returns a pruned copy of the tree with only matching branches \
  * Store reference to original node for later lookup
  */
  static filterTree(
    item: SpatialTreeItem, 
    searchQuery: string, 
    originalRef?: SpatialTreeItem
  ) : SpatialTreeItem | null {
    if (!searchQuery) return item;

    // If this node matches, include it with ALL its descendants
    const matchesSelf = this.nodeMatchesSelf(item, searchQuery);
    if (matchesSelf) {
      return this.includeAllDescendants(originalRef || item);
    }
    
    // Otherwise, check if any children match
    const filteredChildren = (item.children || [])
      .map(child => this.filterTree(child, searchQuery, child))
      .filter(c => c !== null);

    // Include this node only if it has matching descendants
    if (filteredChildren.length > 0) {
      const filtered = {
        ...item,
        children: filteredChildren
      } as SpatialTreeItem & { originalRef?: SpatialTreeItem };
      
      // Store reference to original node for lookup
      filtered.originalRef = originalRef || item;
      
      return filtered;
    }

    return null;
  }

  /** Helper to include all descendants with reference tracking */
  static includeAllDescendants(
    node: SpatialTreeItem
  ) : SpatialTreeItem & { originalRef: SpatialTreeItem } {
    const included = { ...node } as SpatialTreeItem & { originalRef: SpatialTreeItem };
    included.originalRef = node;
    
    if (node.children) {
      included.children = node.children.map(child => this.includeAllDescendants(child));
    }
    
    return included;
  }
}
