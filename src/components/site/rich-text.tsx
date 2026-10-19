import { cn } from "@/lib/utils";

/**
 * Minimal, dependency-free renderer for the light markup used by the CMS body:
 *   ## heading · ### subheading · - bullet · 1. ordered · > quote · **bold** · `code`
 *
 * Keeping this in-house avoids shipping a markdown parser (and its sanitisation
 * surface) for content that is authored by trusted admins only.
 */
function renderInline(text: string, keyPrefix: string) {
  const nodes: React.ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let i = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));
    const token = match[0];
    if (token.startsWith("**")) {
      nodes.push(<strong key={`${keyPrefix}-b-${i}`}>{token.slice(2, -2)}</strong>);
    } else {
      nodes.push(<code key={`${keyPrefix}-c-${i}`}>{token.slice(1, -1)}</code>);
    }
    lastIndex = match.index + token.length;
    i += 1;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

export function RichText({ content, className }: { content: string; className?: string }) {
  if (!content?.trim()) return null;

  const blocks = content.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);

  return (
    <div className={cn("rich-text", className)}>
      {blocks.map((block, index) => {
        const key = `block-${index}`;

        if (block.startsWith("### ")) {
          return <h3 key={key}>{renderInline(block.slice(4), key)}</h3>;
        }
        if (block.startsWith("## ")) {
          return <h2 key={key}>{renderInline(block.slice(3), key)}</h2>;
        }
        if (block.startsWith("> ")) {
          return (
            <blockquote key={key}>
              {renderInline(block.replace(/^> ?/gm, ""), key)}
            </blockquote>
          );
        }

        const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);

        if (lines.length > 0 && lines.every((l) => /^[-*]\s/.test(l))) {
          return (
            <ul key={key}>
              {lines.map((line, li) => (
                <li key={`${key}-${li}`}>{renderInline(line.replace(/^[-*]\s/, ""), `${key}-${li}`)}</li>
              ))}
            </ul>
          );
        }

        if (lines.length > 0 && lines.every((l) => /^\d+[.)]\s/.test(l))) {
          return (
            <ol key={key}>
              {lines.map((line, li) => (
                <li key={`${key}-${li}`}>
                  {renderInline(line.replace(/^\d+[.)]\s/, ""), `${key}-${li}`)}
                </li>
              ))}
            </ol>
          );
        }

        return (
          <p key={key}>
            {lines.map((line, li) => (
              <span key={`${key}-${li}`}>
                {li > 0 ? <br /> : null}
                {renderInline(line, `${key}-${li}`)}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}
