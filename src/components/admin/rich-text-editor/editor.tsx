"use client";

import { useEffect, useState } from "react";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import { Bold, Code, Heading2, Heading3, Italic, Link as LinkIcon, List, ListOrdered, Minus, Quote, Redo2, Undo2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Toggle } from "@/components/ui/toggle";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { editorExtensions } from "./extensions";

/*
 * WYSIWYG editor for CMS bodies. It reads and writes Markdown, and the content
 * uses the site's `.rich-text` styles, so what the editor shows is what the page
 * shows. Loaded lazily by <FormRichText>; the form value lives there.
 */

export type RichTextEditorProps = {
  defaultValue: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
  labelledBy?: string;
  describedBy?: string;
  invalid?: boolean;
};

export default function RichTextEditor({ defaultValue, onChange, placeholder, labelledBy, describedBy, invalid }: RichTextEditorProps) {
  const attributes = {
    class: "rich-text min-h-72 outline-none [&>:first-child]:mt-0",
    role: "textbox",
    "aria-multiline": "true",
    ...(labelledBy ? { "aria-labelledby": labelledBy } : {}),
    ...(describedBy ? { "aria-describedby": describedBy } : {}),
    ...(invalid ? { "aria-invalid": "true" } : {}),
  };
  const editor = useEditor({
    // <FormRichText> loads this with `ssr: false`, so there is no server render
    // to mismatch: create the editor on the first render instead of the next.
    immediatelyRender: true,
    extensions: editorExtensions(placeholder),
    content: defaultValue.replace(/\r\n?/g, "\n"),
    contentType: "markdown",
    editorProps: { attributes },
    onUpdate: ({ editor }) => onChange(editor.getMarkdown()),
  });

  // Validation errors arrive after the editor exists; keep its ARIA state in step.
  useEffect(() => {
    editor.setOptions({ editorProps: { attributes } });
  }, [editor, labelledBy, describedBy, invalid]); // `attributes` derives from these

  return (
    <div
      className={cn(
        "overflow-hidden rounded-(--radius) border border-input bg-card transition-[box-shadow,border-color]",
        "focus-within:border-primary/65 focus-within:ring-3 focus-within:ring-primary/14",
        invalid && "border-destructive ring-destructive/20"
      )}
    >
      <Toolbar editor={editor} />
      <EditorContent editor={editor} className="max-h-[70vh] overflow-y-auto px-5 py-4" />
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const state = useEditorState({
    editor,
    selector: ({ editor }) => ({
      h2: editor.isActive("heading", { level: 2 }),
      h3: editor.isActive("heading", { level: 3 }),
      bold: editor.isActive("bold"),
      italic: editor.isActive("italic"),
      code: editor.isActive("code"),
      bulletList: editor.isActive("bulletList"),
      orderedList: editor.isActive("orderedList"),
      blockquote: editor.isActive("blockquote"),
      link: editor.isActive("link"),
      canUndo: editor.can().undo(),
      canRedo: editor.can().redo(),
    }),
  });
  const chain = () => editor.chain().focus();

  return (
    <div
      role="toolbar"
      aria-label="正文格式"
      className="flex flex-wrap items-center gap-0.5 border-b border-border bg-elevated/60 px-2 py-1.5"
    >
      <Tool label="撤销" shortcut="⌘Z" disabled={!state.canUndo} onClick={() => chain().undo().run()}>
        <Undo2 />
      </Tool>
      <Tool label="重做" shortcut="⇧⌘Z" disabled={!state.canRedo} onClick={() => chain().redo().run()}>
        <Redo2 />
      </Tool>
      <Divider />
      <Tool label="二级标题" shortcut="## 空格" pressed={state.h2} onClick={() => chain().toggleHeading({ level: 2 }).run()}>
        <Heading2 />
      </Tool>
      <Tool label="三级标题" shortcut="### 空格" pressed={state.h3} onClick={() => chain().toggleHeading({ level: 3 }).run()}>
        <Heading3 />
      </Tool>
      <Divider />
      <Tool label="加粗" shortcut="⌘B" pressed={state.bold} onClick={() => chain().toggleBold().run()}>
        <Bold />
      </Tool>
      <Tool label="斜体" shortcut="⌘I" pressed={state.italic} onClick={() => chain().toggleItalic().run()}>
        <Italic />
      </Tool>
      <Tool label="行内代码" shortcut="⌘E" pressed={state.code} onClick={() => chain().toggleCode().run()}>
        <Code />
      </Tool>
      <LinkTool editor={editor} active={state.link} />
      <Divider />
      <Tool label="无序列表" shortcut="- 空格" pressed={state.bulletList} onClick={() => chain().toggleBulletList().run()}>
        <List />
      </Tool>
      <Tool label="有序列表" shortcut="1. 空格" pressed={state.orderedList} onClick={() => chain().toggleOrderedList().run()}>
        <ListOrdered />
      </Tool>
      <Tool label="引用" shortcut="> 空格" pressed={state.blockquote} onClick={() => chain().toggleBlockquote().run()}>
        <Quote />
      </Tool>
      <Tool label="分隔线" shortcut="---" onClick={() => chain().setHorizontalRule().run()}>
        <Minus />
      </Tool>
    </div>
  );
}

function Divider() {
  return <Separator orientation="vertical" className="mx-1 data-[orientation=vertical]:h-5" />;
}

function Tool({
  label,
  shortcut,
  pressed = false,
  disabled,
  onClick,
  children,
}: {
  label: string;
  shortcut?: string;
  pressed?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Toggle size="sm" aria-label={label} pressed={pressed} disabled={disabled} onPressedChange={onClick}>
          {children}
        </Toggle>
      </TooltipTrigger>
      <TooltipContent>
        {label}
        {shortcut ? <span className="ml-2 font-mono opacity-60">{shortcut}</span> : null}
      </TooltipContent>
    </Tooltip>
  );
}

function LinkTool({ editor, active }: { editor: Editor; active: boolean }) {
  const [open, setOpen] = useState(false);
  const [href, setHref] = useState("");

  function apply() {
    const url = href.trim();
    if (!url) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else if (editor.state.selection.empty && !active) {
      // Nothing selected: insert the address itself as the link text.
      editor.chain().focus().insertContent({ type: "text", text: url, marks: [{ type: "link", attrs: { href: url } }] }).run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }
    setOpen(false);
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (next) setHref(editor.getAttributes("link").href ?? "");
        setOpen(next);
      }}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Toggle size="sm" aria-label="链接" pressed={active}>
              <LinkIcon />
            </Toggle>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>链接</TooltipContent>
      </Tooltip>
      <PopoverContent
        align="start"
        className="w-80 space-y-3"
        // Return focus to the text, not the toolbar button — otherwise the Enter
        // that applied the link would press the button and reopen the popover.
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          editor.commands.focus();
        }}
      >
        <Input
          autoFocus
          value={href}
          onChange={(event) => setHref(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              apply();
            }
          }}
          placeholder="https://"
          aria-label="链接地址"
        />
        <div className="flex justify-end gap-2">
          {active ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                editor.chain().focus().extendMarkRange("link").unsetLink().run();
                setOpen(false);
              }}
            >
              移除链接
            </Button>
          ) : null}
          <Button type="button" size="sm" onClick={apply}>
            确定
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
