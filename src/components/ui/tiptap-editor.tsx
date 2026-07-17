"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useCallback } from "react";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Code,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface TiptapEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  editable?: boolean;
  className?: string;
  placeholder?: string;
}

export function TiptapEditor({
  content = "",
  onChange,
  editable = true,
  className,
  placeholder = "Start writing...",
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    editable: editable,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm sm:prose lg:prose-lg xl:prose-xl dark:prose-invert max-w-none focus:outline-none min-h-[300px] px-4 py-3 text-black",
          className,
        ),
      },
    },
  });

  const ToolbarButton = ({
    onClick,
    active,
    children,
    title,
  }: {
    onClick: () => void;
    active?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={cn("h-8 w-8 p-0", active && "bg-gray-200 dark:bg-gray-700")}
      title={title}
    >
      {children}
    </Button>
  );

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
      {editable && (
        <div className="border-b border-gray-300 dark:border-gray-700 text-black p-2 flex flex-wrap gap-1 bg-gray-50 dark:bg-gray-800">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")}
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive("strike")}
            title="Strikethrough"
          >
            <Underline className="h-4 w-4" />
          </ToolbarButton>
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
          <ToolbarButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            active={editor.isActive("heading", { level: 1 })}
            title="Heading 1"
          >
            <Heading1 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            active={editor.isActive("heading", { level: 2 })}
            title="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            active={editor.isActive("heading", { level: 3 })}
            title="Heading 3"
          >
            <Heading3 className="h-4 w-4" />
          </ToolbarButton>
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive("bulletList")}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive("orderedList")}
            title="Ordered List"
          >
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive("blockquote")}
            title="Blockquote"
          >
            <Quote className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            active={editor.isActive("codeBlock")}
            title="Code Block"
          >
            <Code className="h-4 w-4" />
          </ToolbarButton>
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            title="Undo"
          >
            <Undo className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            title="Redo"
          >
            <Redo className="h-4 w-4" />
          </ToolbarButton>
        </div>
      )}
      <EditorContent editor={editor} />
    </div>
  );
}
