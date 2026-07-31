import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getAssetFileTree } from "../../../certificate/api/certificate.api";
import type { AssetTreeNode } from "../../../certificate/types/certificate.types";
import {
  Folder,
  FolderOpen,
  File,
  Image as ImageIcon,
  FileCode,
  FileText,
  ChevronRight,
  ChevronDown,
  Loader2,
} from "lucide-react";

interface AssetFileSelectorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (path: string) => void;
  filterType: "image" | "font" | "ejs" | "";
  title?: string;
}

interface TreeNodeViewProps {
  node: AssetTreeNode;
  selectedPath: string;
  onSelectPath: (path: string) => void;
  onDoubleClickPath: (path: string) => void;
  filterType: string;
}

const TreeNodeView: React.FC<TreeNodeViewProps> = ({
  node,
  selectedPath,
  onSelectPath,
  onDoubleClickPath,
  filterType,
}) => {
  const [expanded, setExpanded] = useState(true);

  if (node.type === "directory") {
    return (
      <div className="select-none">
        <div
          className="flex items-center gap-1.5 py-1 px-2 hover:bg-accent rounded cursor-pointer text-sm font-medium text-gray-700"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
          {expanded ? (
            <FolderOpen className="w-4 h-4 text-amber-500" />
          ) : (
            <Folder className="w-4 h-4 text-amber-500" />
          )}
          <span>{node.name}</span>
        </div>
        {expanded && node.children && node.children.length > 0 && (
          <div className="pl-5 border-l border-gray-100 ml-2.5 mt-0.5 space-y-0.5">
            {node.children.map((child) => (
              <TreeNodeView
                key={child.path}
                node={child}
                selectedPath={selectedPath}
                onSelectPath={onSelectPath}
                onDoubleClickPath={onDoubleClickPath}
                filterType={filterType}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  const isSelected = selectedPath === node.path;

  const getFileIcon = () => {
    if (filterType === "image") return <ImageIcon className="w-4 h-4 text-blue-500" />;
    if (filterType === "ejs") return <FileCode className="w-4 h-4 text-orange-500" />;
    if (filterType === "font") return <FileText className="w-4 h-4 text-purple-500" />;
    return <File className="w-4 h-4 text-gray-500" />;
  };

  return (
    <div
      className={`flex items-center gap-2 py-1.5 px-2 rounded cursor-pointer text-sm transition-colors ${
        isSelected
          ? "bg-primary/10 text-primary font-medium border border-primary/20"
          : "hover:bg-accent text-gray-600"
      }`}
      onClick={() => onSelectPath(node.path)}
      onDoubleClick={() => onDoubleClickPath(node.path)}
    >
      <span className="w-4" />
      {getFileIcon()}
      <span className="truncate">{node.name}</span>
      <span className="ml-auto text-[11px] text-muted-foreground">{node.path}</span>
    </div>
  );
};

export const AssetFileSelectorDialog: React.FC<AssetFileSelectorDialogProps> = ({
  isOpen,
  onClose,
  onSelect,
  filterType,
  title,
}) => {
  const [tree, setTree] = useState<AssetTreeNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPath, setSelectedPath] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      setSelectedPath("");
      const fetchTree = async () => {
        setLoading(true);
        try {
          const data = await getAssetFileTree(filterType);
          setTree(data);
        } catch (error) {
          console.error("Failed to fetch asset file tree:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchTree();
    }
  }, [isOpen, filterType]);

  const handleConfirm = () => {
    if (selectedPath) {
      onSelect(selectedPath);
      onClose();
    }
  };

  const handleDoubleClick = (path: string) => {
    onSelect(path);
    onClose();
  };

  const getDialogTitle = () => {
    if (title) return title;
    if (filterType === "image") return "Select Asset Image";
    if (filterType === "font") return "Select Asset Font";
    if (filterType === "ejs") return "Select EJS Template File";
    return "Select Asset File";
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <DialogDescription>
            Browse the server-side assets folder and click on a file to select its relative path.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto border rounded-md p-3 min-h-[280px] max-h-[420px] bg-white">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="text-sm">Loading asset files...</span>
            </div>
          ) : tree.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
              No matching files found in assets folder.
            </div>
          ) : (
            <div className="space-y-1">
              {tree.map((node) => (
                <TreeNodeView
                  key={node.path}
                  node={node}
                  selectedPath={selectedPath}
                  onSelectPath={setSelectedPath}
                  onDoubleClickPath={handleDoubleClick}
                  filterType={filterType}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between bg-gray-50 p-2.5 rounded border text-xs text-muted-foreground">
          <span className="truncate">
            Selected: <strong className="text-foreground">{selectedPath || "None"}</strong>
          </span>
        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" disabled={!selectedPath} onClick={handleConfirm}>
            Select File
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
