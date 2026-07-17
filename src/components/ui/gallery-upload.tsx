"use client";

import { useState, useCallback } from "react";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { X, GripVertical, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export interface GalleryUploadProps {
  value?: string[];
  onChange?: (urls: string[]) => void;
  maxImages?: number;
  subfolder?: string;
  label?: string;
  className?: string;
}

function SortableImage({
  url,
  onRemove,
  index,
}: {
  url: string;
  onRemove: () => void;
  index: number;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: url });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group"
    >
      <div className="relative aspect-square rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700">
        <img
          src={url}
          alt={`Gallery image ${index + 1}`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onRemove}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing"
          >
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <GripVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function GalleryUpload({
  value = [],
  onChange,
  maxImages = 10,
  subfolder = "journals/gallery",
  label = "Gallery Images",
  className,
}: GalleryUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadUrl, setUploadUrl] = useState<string>("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddImage = useCallback(() => {
    if (uploadUrl && value.length < maxImages) {
      onChange?.([...value, uploadUrl]);
      setUploadUrl("");
    }
  }, [uploadUrl, value, maxImages, onChange]);

  const handleRemoveImage = useCallback(
    (urlToRemove: string) => {
      onChange?.(value.filter((url) => url !== urlToRemove));
    },
    [value, onChange]
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = value.indexOf(active.id as string);
      const newIndex = value.indexOf(over.id as string);
      onChange?.(arrayMove(value, oldIndex, newIndex));
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}

      {value.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={value}
            strategy={verticalListSortingStrategy}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {value.map((url, index) => (
                <SortableImage
                  key={url}
                  url={url}
                  index={index}
                  onRemove={() => handleRemoveImage(url)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {value.length < maxImages && (
        <div className="space-y-4">
          <FileUpload
            label={value.length === 0 ? "Upload first image" : "Add another image"}
            fileType="image"
            subfolder={subfolder}
            value={uploadUrl}
            onChange={setUploadUrl}
            accept="image/*"
            maxSize={4 * 1024 * 1024}
            showRemove={false}
          />
          {uploadUrl && (
            <Button
              type="button"
              onClick={handleAddImage}
              disabled={isUploading}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add to Gallery ({value.length + 1}/{maxImages})
            </Button>
          )}
        </div>
      )}

      <p className="text-xs text-gray-500 dark:text-gray-400">
        {value.length} of {maxImages} images uploaded. Drag images to reorder.
      </p>
    </div>
  );
}
