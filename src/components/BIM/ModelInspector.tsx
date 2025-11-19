import { useEffect, useState } from "react";
import * as OBC from "@thatopen/components";
import type { SpatialTreeItem, FragmentsModel } from "@thatopen/fragments";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import * as Accordion from "@radix-ui/react-accordion";
import di from "@/lib/di";
import Constants from "@/domain/Constants";
import useBimComponent from "@/hooks/useBimComponent";
import type * as OBF from "@thatopen/components-front";

type ModelTreeProps = {
  readonly isLoading: boolean;
};

type TreeNodeProps = {
  readonly item: SpatialTreeItem;
  readonly modelId: string;
  readonly level: number;
  readonly onSelect: (modelId: string, item: SpatialTreeItem) => void;
  readonly searchTerm?: string;
};

// Helper function to check if a node or its children match the search term
function nodeMatchesSearch(item: SpatialTreeItem, searchTerm: string): boolean {
  if (!searchTerm) return false;
  const term = searchTerm.toLowerCase();
  const displayName = (item.category || `Item ${item.localId ?? "Unknown"}`).toLowerCase();
  const localIdStr = item.localId?.toString().toLowerCase() || "";
  
  if (displayName.includes(term) || localIdStr.includes(term)) {
    return true;
  }
  
  // Check children recursively
  if (item.children) {
    return item.children.some(child => nodeMatchesSearch(child, searchTerm));
  }
  
  return false;
}

// Removed visual highlight of search matches per request

function TreeNode({ item, modelId, level, onSelect, searchTerm = "" }: TreeNodeProps) {
  const hasChildren = item.children && item.children.length > 0;
  const displayName = item.category || `Item ${item.localId ?? "Unknown"}`;
  const indent = level * 16;
  
  // Check if this node or its children match the search
  const matchesSearch = searchTerm ? nodeMatchesSearch(item, searchTerm) : false;
  const hasMatchingChildren = searchTerm && item.children 
    ? item.children.some(child => nodeMatchesSearch(child, searchTerm))
    : false;
  
  // Auto-expand if it matches search or has matching children, otherwise default to first 2 levels
  const shouldAutoExpand = searchTerm ? (matchesSearch || hasMatchingChildren) : (level < 2);
  const [expanded, setExpanded] = useState(shouldAutoExpand);
  
  // Update expanded state when search term changes
  useEffect(() => {
    if (searchTerm) {
      setExpanded(matchesSearch || hasMatchingChildren);
    } else {
      // Reset to default expansion when search is cleared
      setExpanded(level < 2);
    }
  }, [searchTerm, matchesSearch, hasMatchingChildren, level]);

  return (
    <div className="select-none">
      <div
        className="flex items-center gap-1 px-2 py-1 hover:bg-blue-50 cursor-pointer text-xs transition-colors"
        style={{ paddingLeft: `${8 + indent}px` }}
        onClick={() => {
          console.log("[TreeNode] Clicked on node:", {
            modelId,
            localId: item.localId,
            category: item.category,
            hasChildren: hasChildren
          });
          onSelect(modelId, item);
        }}
        onDoubleClick={(e) => {
          if (hasChildren) {
            e.stopPropagation();
            setExpanded(!expanded);
          }
        }}
      >
        {hasChildren && (
          <button
            className="w-4 h-4 flex items-center justify-center hover:bg-gray-200 rounded"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
          >
            <span className="text-[10px]">
              {expanded ? "▼" : "▶"}
            </span>
          </button>
        )}
        {!hasChildren && <span className="w-4" />}
        <span className="flex-1 truncate">{displayName}</span>
        {item.localId !== null && (
          <span className="text-[10px] text-gray-400 ml-2">#{item.localId}</span>
        )}
      </div>
      
      {hasChildren && expanded && (
        <div>
          {item.children!.map((child, index) => (
            <TreeNode
              key={`${child.localId}-${index}`}
              item={child}
              modelId={modelId}
              level={level + 1}
              onSelect={onSelect}
              searchTerm={searchTerm}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ModelInspector({ isLoading }: ModelTreeProps) {
  const [trees, setTrees] = useState<Array<{ modelId: string; tree: SpatialTreeItem }>>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const fragmentsManager = di.get<OBC.FragmentsManager>(Constants.FragmentsManagerKey);
  const highlighter = useBimComponent<OBF.Highlighter>(Constants.HighlighterKey);

  // Returns a pruned copy of the tree with only matching branches
  function filterTree(item: SpatialTreeItem, term: string): SpatialTreeItem | null {
    if (!term) return item;

    const matchesSelf = nodeMatchesSearch(item, term);
    const filteredChildren = (item.children || [])
      .map(child => filterTree(child, term))
      .filter((c): c is SpatialTreeItem => c !== null);

    if (matchesSelf || filteredChildren.length > 0) {
      return {
        ...item,
        children: filteredChildren.length > 0 ? filteredChildren : undefined
      } as SpatialTreeItem;
    }

    return null;
  }

  useEffect(() => {
    console.log("[ModelInspector] Highlighter component state:", {
      highlighter: !!highlighter,
      enabled: highlighter?.enabled,
      hasConfig: !!highlighter?.config,
      selectName: highlighter?.config?.selectName
    });
  }, [highlighter]);

  useEffect(() => {
    if (!fragmentsManager) return;

    const loadTreeForModel = async (modelId: string, model: FragmentsModel, maxRetries = 10): Promise<SpatialTreeItem | null> => {
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          // Wait for fragments core to be updated
          await fragmentsManager.core.update(true);
          
          // Try to get spatial structure
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
      const newTrees: Array<{ modelId: string; tree: SpatialTreeItem }> = [];
      
      for (const [modelId, model] of fragmentsManager.list) {
        const tree = await loadTreeForModel(modelId, model);
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

  function collectLocalIds(item: SpatialTreeItem, acc: Set<number>) {
    if (item.localId !== null && item.localId !== undefined) {
      acc.add(item.localId);
    }
    if (item.children) {
      for (const child of item.children) collectLocalIds(child, acc);
    }
  }

  const handleNodeSelect = async (modelId: string, item: SpatialTreeItem) => {
    console.log("[ModelInspector] handleNodeSelect called", { modelId, localId: item.localId, category: item.category });
    
    if (!highlighter) {
      console.warn("[ModelInspector] Highlighter is null/undefined");
      return;
    }
    
    // Build a set of IDs to highlight. If the node has children (category/group),
    // collect all descendant leaf IDs; otherwise highlight the single item.
    let idsToHighlight = new Set<number>();
    collectLocalIds(item, idsToHighlight);
    if (idsToHighlight.size === 0) {
      console.warn("[ModelInspector] No localIds found for node; nothing to highlight");
      return;
    }

    console.log("[ModelInspector] Highlighter state:", {
      enabled: highlighter.enabled,
      hasConfig: !!highlighter.config,
      selectName: highlighter.config?.selectName
    });

    if (!highlighter.enabled) {
      console.warn("[ModelInspector] Highlighter is not enabled");
      return;
    }

    // Create ModelIdMap for highlighting
    // If this is a category node (e.g., IFCROOF), filter descendants by type to avoid highlighting unrelated items
    try {
      const fm = di.get<OBC.FragmentsManager>(Constants.FragmentsManagerKey);
      const model = fm?.list.get(modelId);
      const requestedType = item.category || undefined;
      if (model && requestedType) {
        const candidateIds = Array.from(idsToHighlight);
        const items: any[] = await Promise.all(
          candidateIds.map((id) => (model as any).getItemData(id))
        );
        const filteredIds: number[] = items
          .filter((d: any) => !!d && d.type === requestedType)
          .map((d: any) => d.id as number);
        const filtered = new Set<number>(filteredIds);
        if (filtered.size > 0) {
          idsToHighlight = filtered;
        }
      }
    } catch (e) {
      console.warn("[ModelInspector] Type-filtering failed, using collected IDs", e);
    }

    const modelIdMap: OBC.ModelIdMap = { [modelId]: idsToHighlight };

    console.log("[ModelInspector] Created ModelIdMap:", {
      modelIdMap,
      modelId,
      requestedLocalId: item.localId,
      setSize: modelIdMap[modelId]?.size,
      category: item.category,
      exampleFew: Array.from(idsToHighlight).slice(0, 10)
    });

    // Verify the model exists in fragmentsManager
    const fragmentsManager = di.get<OBC.FragmentsManager>(Constants.FragmentsManagerKey);
    if (fragmentsManager) {
      const model = fragmentsManager.list.get(modelId);
      console.log("[ModelInspector] Model verification:", {
        modelExists: !!model,
        modelId,
        modelKeys: fragmentsManager.list.keys ? Array.from(fragmentsManager.list.keys()) : "N/A"
      });
    }

    // Highlight the selected item using the selection name from config
    const selectName = highlighter.config.selectName;
    console.log("[ModelInspector] About to call highlightByID:", {
      selectName,
      modelIdMap,
      autoFit: true,
      highlight: false
    });

    try {
      await highlighter.highlightByID(selectName, modelIdMap, true, false);
      console.log("[ModelInspector] highlightByID completed successfully");
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
            {/* Search input */}
            <div className="sticky top-0 bg-white z-10 pb-2 border-b">
              <input
                type="text"
                placeholder="Search nodes by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="mt-1 text-xs text-gray-500 hover:text-gray-700"
                >
                  Clear search
                </button>
              )}
            </div>
            
            {(searchTerm
              ? trees.map(({ modelId, tree }) => {
                  const filtered = filterTree(tree, searchTerm);
                  if (!filtered) return null;
                  return (
                    <div key={modelId} className="border rounded p-2">
                      <div className="font-semibold text-xs mb-1 pb-1 border-b text-gray-700">
                        Model: {modelId}
                      </div>
                <TreeNode
                  item={filtered}
                  modelId={modelId}
                  level={0}
                  onSelect={handleNodeSelect}
                  searchTerm={searchTerm}
                />
                    </div>
                  );
                })
              : trees.map(({ modelId, tree }) => (
              <div key={modelId} className="border rounded p-2">
                <div className="font-semibold text-xs mb-1 pb-1 border-b text-gray-700">
                  Model: {modelId}
                </div>
                <TreeNode
                  item={tree}
                  modelId={modelId}
                  level={0}
                  onSelect={handleNodeSelect}
                  searchTerm={searchTerm}
                />
              </div>
            )))}
            {searchTerm && trees.every(({ tree }) => filterTree(tree, searchTerm) === null) && (
              <div className="text-xs text-gray-500 p-2">No results found.</div>
            )}
          </div>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  );
}

