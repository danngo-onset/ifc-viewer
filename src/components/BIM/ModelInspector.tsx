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
  readonly onSelect: (modelId: string, localId: number | null) => void;
};

function TreeNode({ item, modelId, level, onSelect }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(level < 2); // Auto-expand first 2 levels
  const hasChildren = item.children && item.children.length > 0;
  const displayName = item.category || `Item ${item.localId ?? "Unknown"}`;
  const indent = level * 16;

  return (
    <div className="select-none">
      <div
        className="flex items-center gap-1 px-2 py-1 hover:bg-blue-50 cursor-pointer text-xs transition-colors"
        style={{ paddingLeft: `${8 + indent}px` }}
        onClick={() => {
          if (item.localId !== null) {
            onSelect(modelId, item.localId);
          }
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
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ModelInspector({ isLoading }: ModelTreeProps) {
  const [trees, setTrees] = useState<Array<{ modelId: string; tree: SpatialTreeItem }>>([]);
  const fragmentsManager = di.get<OBC.FragmentsManager>(Constants.FragmentsManagerKey);
  const highlighter = useBimComponent<OBF.Highlighter>(Constants.HighlighterKey);

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

  const handleNodeSelect = async (modelId: string, localId: number | null) => {
    if (!highlighter || localId === null) return;

    // Create ModelIdMap for highlighting
    const modelIdMap: OBC.ModelIdMap = {
      [modelId]: new Set([localId])
    };

    // Highlight the selected item using the selection name from config
    const selectName = highlighter.config.selectName;
    await highlighter.highlightByID(selectName, modelIdMap, true, false);
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
            {trees.map(({ modelId, tree }) => (
              <div key={modelId} className="border rounded p-2">
                <div className="font-semibold text-xs mb-1 pb-1 border-b text-gray-700">
                  Model: {modelId}
                </div>
                <TreeNode
                  item={tree}
                  modelId={modelId}
                  level={0}
                  onSelect={handleNodeSelect}
                />
              </div>
            ))}
          </div>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  );
}

