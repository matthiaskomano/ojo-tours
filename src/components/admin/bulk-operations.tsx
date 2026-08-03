"use client";

import React, { useState } from "react";
import {
  CheckSquare,
  Square,
  Trash2,
  Archive,
  Eye,
  EyeOff,
  Download,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface BulkOperationsProps {
  items: Array<{ id: string; [key: string]: any }>;
  itemType: "bookings" | "users" | "tours" | "lodges" | "journals" | "gallery" | "notifications";
  onBulkAction?: (action: string, selectedIds: string[]) => Promise<void>;
  selectedIds?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
}

export function BulkOperations({
  items,
  itemType,
  onBulkAction,
  selectedIds: externalSelectedIds,
  onSelectionChange,
}: BulkOperationsProps) {
  const [internalSelectedIds, setInternalSelectedIds] = useState<string[]>([]);
  const [isAllSelected, setIsAllSelected] = useState(false);

  const selectedIds = externalSelectedIds || internalSelectedIds;
  const setSelectedIds = onSelectionChange || setInternalSelectedIds;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
      setIsAllSelected(false);
    } else {
      setSelectedIds(items.map(item => item.id));
      setIsAllSelected(true);
    }
  };

  const toggleSelectItem = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
      setIsAllSelected(false);
    } else {
      setSelectedIds([...selectedIds, id]);
      if (selectedIds.length + 1 === items.length) {
        setIsAllSelected(true);
      }
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedIds.length === 0) {
      toast.error("Please select at least one item");
      return;
    }

    try {
      if (onBulkAction) {
        await onBulkAction(action, selectedIds);
        toast.success(`Successfully ${action} ${selectedIds.length} items`);
        setSelectedIds([]);
        setIsAllSelected(false);
      }
    } catch (error) {
      toast.error(`Failed to ${action} items`);
      console.error(error);
    }
  };

  const getAvailableActions = () => {
    switch (itemType) {
      case "bookings":
        return [
          { value: "confirm", label: "Confirm", icon: CheckSquare },
          { value: "decline", label: "Decline", icon: Archive },
          { value: "cancel", label: "Cancel", icon: Archive },
          { value: "delete", label: "Delete", icon: Trash2, destructive: true },
        ];
      case "users":
        return [
          { value: "activate", label: "Activate", icon: Eye },
          { value: "deactivate", label: "Deactivate", icon: EyeOff },
          { value: "delete", label: "Delete", icon: Trash2, destructive: true },
        ];
      case "tours":
      case "lodges":
        return [
          { value: "activate", label: "Activate", icon: Eye },
          { value: "deactivate", label: "Deactivate", icon: EyeOff },
          { value: "delete", label: "Delete", icon: Trash2, destructive: true },
        ];
      case "journals":
        return [
          { value: "publish", label: "Publish", icon: CheckSquare },
          { value: "draft", label: "Set to Draft", icon: Archive },
          { value: "archive", label: "Archive", icon: Archive },
          { value: "delete", label: "Delete", icon: Trash2, destructive: true },
        ];
      case "gallery":
        return [
          { value: "delete", label: "Delete", icon: Trash2, destructive: true },
        ];
      case "notifications":
        return [
          { value: "mark-read", label: "Mark as Read", icon: CheckSquare },
          { value: "delete", label: "Delete", icon: Trash2, destructive: true },
        ];
      default:
        return [];
    }
  };

  const actions = getAvailableActions();

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      {/* Select All Checkbox */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleSelectAll}
        className="flex items-center gap-2"
      >
        {isAllSelected ? (
          <CheckSquare className="h-4 w-4" />
        ) : (
          <Square className="h-4 w-4" />
        )}
        <span className="text-sm">Select All ({items.length})</span>
      </Button>

      {/* Selection Count */}
      {selectedIds.length > 0 && (
        <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
          {selectedIds.length} selected
        </Badge>
      )}

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreVertical className="h-4 w-4 mr-2" />
                Bulk Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {actions.map((action) => {
                const Icon = action.icon;
                return (
                  <DropdownMenuItem
                    key={action.value}
                    onClick={() => handleBulkAction(action.value)}
                    className={action.destructive ? "text-red-600" : ""}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {action.label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Export */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkAction("export")}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      )}

      {/* Clear Selection */}
      {selectedIds.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSelectedIds([]);
            setIsAllSelected(false);
          }}
        >
          Clear Selection
        </Button>
      )}
    </div>
  );
}

// Checkbox component for individual rows
export function SelectableCheckbox({
  itemId,
  isSelected,
  onToggle,
}: {
  itemId: string;
  isSelected: boolean;
  onToggle: (id: string) => void;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => onToggle(itemId)}
      className="h-8 w-8 p-0"
    >
      {isSelected ? (
        <CheckSquare className="h-4 w-4 text-blue-600" />
      ) : (
        <Square className="h-4 w-4" />
      )}
    </Button>
  );
}
