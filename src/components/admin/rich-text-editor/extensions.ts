import { Markdown } from "@tiptap/markdown";
import { Placeholder } from "@tiptap/extensions";
import StarterKit from "@tiptap/starter-kit";

/**
 * Editor schema for CMS bodies. Everything here must survive a Markdown round
 * trip, because the body is stored as Markdown and rendered by <RichText>.
 */
export function editorExtensions(placeholder = "") {
  return [
    StarterKit.configure({
      // The page title is the <h1>; bodies use ## and ###.
      heading: { levels: [2, 3] },
      // Markdown has no underline.
      underline: false,
      link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
    }),
    // `breaks`: a single newline is a line break, matching the site renderer.
    Markdown.configure({ markedOptions: { breaks: true, gfm: true } }),
    Placeholder.configure({ placeholder }),
  ];
}
