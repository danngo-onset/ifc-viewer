import { useEffect, useState } from "react";

import * as OBC from "@thatopen/components";
import type * as OBF from "@thatopen/components-front";
import type { SpatialTreeItem, FragmentsModel } from "@thatopen/fragments";

import { ChevronDownIcon } from "@radix-ui/react-icons";
import * as Accordion from "@radix-ui/react-accordion";

import BimExtensions from "@/lib/extensions/bim-extensions";

import Constants from "@/domain/Constants";

import useBimComponent from "@/hooks/useBimComponent";

import TreeNode from "./TreeNode";

type ModelInspectorProps = {
  readonly isLoading: boolean;
};

export const ModelInspector = ({ isLoading }: ModelInspectorProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [trees, setTrees] = useState<Array<{ modelId: string; tree: SpatialTreeItem }>>([]);
  
  const fragmentsManager = useBimComponent<OBC.FragmentsManager>(Constants.FragmentsManagerKey);
  const highlighter = useBimComponent<OBF.Highlighter>(Constants.HighlighterKey);

  useEffect(() => {
    if (!fragmentsManager) return;

    const loadModelTree = async (
      modelId: string, 
      model: FragmentsModel, 
      maxRetries = 10
    ) => {
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          await fragmentsManager.core.update(true);
          
          const tree = await model.getSpatialStructure();
          return tree;
        } catch (error) {
          if (attempt < maxRetries - 1) {
            // Wait with exponential backoff before retrying
            await new Promise(resolve => setTimeout(resolve, 200 * (attempt + 1)));
          } else {
            console.error(`Error loading spatial structure for model ${modelId} after ${maxRetries} attempts:`, error);
            return null;
          }
        }
      }
      
      return null;
    };

    const loadTrees = async () => {
      const newTrees = new Array<{ modelId: string; tree: SpatialTreeItem }>();
      
      for (const [modelId, model] of fragmentsManager.list) {
        const tree = await loadModelTree(modelId, model);
        if (tree) {
          newTrees.push({ modelId, tree });
        }
      }
      
      if (newTrees.length > 0) {
        setTrees(newTrees);
      }
    };

    // Load trees when models are added
    const handleModelAdded = async () => {
      await loadTrees();
    };

    fragmentsManager.list.onItemSet.add(handleModelAdded);
    loadTrees();

    return () => {
      fragmentsManager.list.onItemSet.remove(handleModelAdded);
    };
  }, [fragmentsManager]);

  function collectLocalIds(item: SpatialTreeItem, accumulator: Set<number>) {
    if (item.localId !== null && item.localId !== undefined) {
      accumulator.add(item.localId);
    }
    
    if (item.children) {
      for (const child of item.children) collectLocalIds(child, accumulator);
    }
  }

  // Find a node in the original tree by matching its properties
  function findNodeInOriginalTree(tree: SpatialTreeItem, targetItem: SpatialTreeItem): SpatialTreeItem | null {
    // For nodes with localId, match by localId (most specific)
    if (targetItem.localId !== null && targetItem.localId !== undefined) {
      if (tree.localId === targetItem.localId) {
        return tree;
      }
    } else {
      // For category nodes without localId, match by category
      if (tree.category === targetItem.category && 
          tree.localId === targetItem.localId) {
        return tree;
      }
    }
    
    // Search in children
    if (tree.children) {
      for (const child of tree.children) {
        const found = findNodeInOriginalTree(child, targetItem);
        if (found) return found;
      }
    }
    
    return null;
  }

  const handleNodeSelect = async (modelId: string, item: SpatialTreeItem) => {
    if (!highlighter || !fragmentsManager) return;
    if (!highlighter.enabled) return;
    
    console.log("[ModelInspector] handleNodeSelect called", { 
      localId: item.localId, 
      category: item.category,
      hasChildren: !!item.children,
      childrenCount: item.children?.length || 0
    });
    
    // Use the original reference stored during filtering, or fall back to tree search
    const itemWithRef = item as SpatialTreeItem & { __originalRef?: SpatialTreeItem };
    let originalNode: SpatialTreeItem | null | undefined = itemWithRef.__originalRef;
    
    if (!originalNode) {
      // Fallback: Find the clicked node in the original unfiltered tree
      const originalTree = trees.find(t => t.modelId === modelId)?.tree;
      originalNode = originalTree ? findNodeInOriginalTree(originalTree, item) : null;
    }
    
    console.log("[ModelInspector] Original node lookup", {
      foundOriginal: !!originalNode,
      originalHasChildren: !!originalNode?.children,
      originalChildrenCount: originalNode?.children?.length || 0,
      usedStoredRef: !!itemWithRef.__originalRef
    });
    
    // Use original node if found, otherwise use the filtered item
    const nodeToCollect = originalNode || item;
    
    // Build a set of IDs to highlight. If the node has children (category/group),
    // collect all descendant leaf IDs; otherwise highlight the single item.
    let idsToHighlight = new Set<number>();
    collectLocalIds(nodeToCollect, idsToHighlight);
    
    console.log("[ModelInspector] Collected IDs", { count: idsToHighlight.size });
    
    if (idsToHighlight.size === 0) {
      console.log("[ModelInspector] No localIds found for node; nothing to highlight");
      return;
    }

    // Create ModelIdMap for highlighting
    // If this is a category node (e.g., IFCROOF), filter descendants by type to avoid highlighting unrelated items
    try {
      const model = fragmentsManager.list.get(modelId);
      const requestedType = item.category;

      if (model && requestedType) {
        const candidateIds = Array.from(idsToHighlight);
        const items = await model.getItemsData(candidateIds);

        const filteredIds = items
          .filter(d => {
            if (!d || !d.type) return false;
            if (Array.isArray(d.type)) return false;

            return d.type.value === requestedType;
          })
          .map(d => {
            if (!d.id || Array.isArray(d.id)) return null;
            
            return d.id.value;
          })
          .filter(id=> id !== null) as number[];

        const filtered = new Set<number>(filteredIds);
        if (filtered.size > 0) {
          idsToHighlight = filtered;
        }
      }
    } catch (e) {
      console.error("[ModelInspector] Type-filtering failed, using collected IDs", e);
    }

    const modelIdMap: OBC.ModelIdMap = { 
      [modelId]: idsToHighlight 
    };

    // Highlight the selected item using the selection name from config
    const selectName = highlighter.config.selectName;
    try {
      await highlighter.highlightByID(selectName, modelIdMap, true, false);
    } catch (error) {
      console.error("[ModelInspector] Error calling highlightByID:", error);
    }
  };

  if (trees.length === 0) {
    return (
      <Accordion.Root type="single" collapsible className="relative z-10 w-full">
        <Accordion.Item value="model-tree" className="border border-gray-300 rounded-md bg-white">
          <Accordion.Header>
            <Accordion.Trigger className="accordion-trigger">
              <p>Model Tree</p>
              
              <ChevronDownIcon className="w-4 h-4" />
            </Accordion.Trigger>
          </Accordion.Header>

          <Accordion.Content className="accordion-content">
            <div className="p-2 text-sm text-gray-500">
              {isLoading ? "Loading model structure..." : "No models loaded"}
            </div>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
    );
  }

  // Returns a pruned copy of the tree with only matching branches
  // Store reference to original node for later lookup
  function filterTree(item: SpatialTreeItem, searchQuery: string, originalRef?: SpatialTreeItem) : SpatialTreeItem | null {
    if (!searchQuery) return item;

    const matchesSelf = BimExtensions.nodeMatchesSearch(item, searchQuery);
    const filteredChildren = (item.children || [])
      .map(child => filterTree(child, searchQuery, child))
      .filter(c => c !== null);

    if (matchesSelf || filteredChildren.length > 0) {
      const filtered = {
        ...item,
        // Only show children that match the search
        // When clicked, we'll find the original node to collect all IDs
        children: filteredChildren.length > 0 ? filteredChildren : undefined
      } as SpatialTreeItem & { __originalRef?: SpatialTreeItem };
      
      // Store reference to original node for lookup
      filtered.__originalRef = originalRef || item;
      
      return filtered;
    }

    return null;
  }

  return (
    <Accordion.Root type="single" collapsible className="relative z-10 w-full">
      <Accordion.Item value="model-tree" className="border border-gray-300 rounded-md bg-white">
        <Accordion.Header>
          <Accordion.Trigger className="accordion-trigger">
            <p>Model Tree</p>

            <ChevronDownIcon className="w-4 h-4" />
          </Accordion.Trigger>
        </Accordion.Header>

        <Accordion.Content className="accordion-content">
          <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
            <div className="sticky top-0 bg-white z-10 pb-2 border-b">
              <input
                type="text"
                placeholder="Search nodes by name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-1 text-xs text-gray-500 hover:text-gray-700"
                >
                  Clear search
                </button>
              )}
            </div>
            
            {(searchQuery
              ? trees.map(({ modelId, tree }) => {
                const filtered = filterTree(tree, searchQuery, tree);
                if (!filtered) return null;

                return (
                  <div key={modelId} className="border rounded p-2">
                    <p className="font-semibold text-xs mb-1 pb-1 border-b text-gray-700">
                      Model: {modelId}
                    </p>

                    <TreeNode
                      item={filtered}
                      modelId={modelId}
                      level={0}
                      onSelect={handleNodeSelect}
                      searchQuery={searchQuery}
                    />
                  </div>
                );
              })
              : trees.map(({ modelId, tree }) => (
              <div key={modelId} className="border rounded p-2">
                <p className="font-semibold text-xs mb-1 pb-1 border-b text-gray-700">
                  Model: {modelId}
                </p>

                <TreeNode
                  item={tree}
                  modelId={modelId}
                  level={0}
                  onSelect={handleNodeSelect}
                  searchQuery={searchQuery}
                />
              </div>
            )))}

            {searchQuery && trees.every(({ tree }) => filterTree(tree, searchQuery, tree) === null) && (
              <p className="text-xs text-gray-500 p-2">No results found.</p>
            )}
          </div>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  );
};
