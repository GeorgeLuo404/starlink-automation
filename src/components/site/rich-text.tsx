import Markdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

/**
 * Renders a CMS body (Markdown, written in the admin's rich-text editor).
 *
 * Raw HTML in the source is shown as text, not rendered. Single line breaks
 * stay line breaks (remark-breaks), as they did before the editor existed.
 */
export function RichText({ content, className }: { content: string; className?: string }) {
  if (!content?.trim()) return null;

  return (
    <div className={cn("rich-text", className)}>
      {/* Bodies saved from a <textarea> have CRLF line endings. */}
      <Markdown remarkPlugins={[remarkGfm, remarkBreaks]}>{content.replace(/\r\n?/g, "\n")}</Markdown>
    </div>
  );
}
