import { useState, useEffect } from "react";

import type { SpatialTreeItem } from "@thatopen/fragments";

import BimExtensions from "@/lib/extensions/bim-extensions";

type TreeNodeProps = {
  readonly item: SpatialTreeItem;
  readonly modelId: string;
  readonly level: number;
  readonly onSelect: (modelId: string, item: SpatialTreeItem) => void;
  readonly searchQuery?: string;
};

export default function TreeNode({ 
  item, 
  modelId, 
  level, 
  onSelect, 
  searchQuery = "" 
}: TreeNodeProps) {
  const hasChildren = item.children && item.children.length > 0;
  const displayName = item.category || `Item ${item.localId ?? "Unknown"}`;
  const indent = level * 8;
  
  // Check if this node or its children match the search
  const matchesSearch = searchQuery ? BimExtensions.nodeMatchesSearch(item, searchQuery) 
                                    : false;

  const hasMatchingChildren = searchQuery && item.children 
    ? item.children.some(child => BimExtensions.nodeMatchesSearch(child, searchQuery))
    : false;
  
  // Auto-expand if it matches search or has matching children, otherwise default to first 2 levels
  const shouldAutoExpand = searchQuery ? (matchesSearch || hasMatchingChildren) 
                                       : (level < 2);
  const [expanded, setExpanded] = useState(shouldAutoExpand);
  
  // Update expanded state when search term changes
  useEffect(() => {
    if (searchQuery) {
      setExpanded(matchesSearch || hasMatchingChildren);
    } else {
      // Reset to default expansion when search is cleared
      setExpanded(level < 2);
    }
  }, [searchQuery, matchesSearch, hasMatchingChildren, level]);

  return (
    <div className="select-none">
      <div
        onClick={() => onSelect(modelId, item)}
        onDoubleClick={(e) => {
          if (hasChildren) {
            e.stopPropagation();
            setExpanded(!expanded);
          }
        }}
        style={{ paddingLeft: `${8 + indent}px` }}
        className="flex items-center gap-1 px-2 py-1 hover:bg-blue-50 cursor-pointer text-xs transition-colors"
      >
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="w-4 h-4 flex items-center justify-center hover:bg-gray-200 rounded"
          >
            <span className="text-[10px]">
              {expanded ? "▼" : "▶"}
            </span>
          </button>
        )}

        {!hasChildren && <span className="w-0 -ml-0.5" />}

        <p className="flex-1 truncate">{displayName}</p>

        {item.localId !== null && (
          <p className="text-[10px] text-gray-400 ml-2">#{item.localId}</p>
        )}
      </div>
      
      {hasChildren && expanded && (
        <div>
          {item.children?.map((child, index) => (
            <TreeNode
              key={`${child.localId}-${index}`}
              item={child}
              modelId={modelId}
              level={level + 1}
              onSelect={onSelect}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      )}
    </div>
  );
};
