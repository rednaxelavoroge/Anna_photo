import Link from "next/link";
import type { ReactNode } from "react";

function safeHref(href: string) {
  if (href.startsWith("/") || href.startsWith("#")) return href;
  try {
    const url = new URL(href);
    if (url.protocol === "http:" || url.protocol === "https:" || url.protocol === "mailto:") {
      return href;
    }
  } catch {
    return null;
  }
  return null;
}

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*[^*]+?\*\*|\*[^*]+?\*|\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = pattern.exec(text))) {
    if (match.index > last) {
      nodes.push(text.slice(last, match.index));
    }
    const token = match[0];
    if (token.startsWith("**")) {
      nodes.push(<strong key={key}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("*")) {
      nodes.push(<em key={key}>{token.slice(1, -1)}</em>);
    } else {
      const link = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (link) {
        const href = safeHref(link[2]);
        if (href) {
          const internal = href.startsWith("/") || href.startsWith("#");
          nodes.push(
            internal ? (
              <Link key={key} href={href} className="link-line">
                {link[1]}
              </Link>
            ) : (
              <a key={key} href={href} className="link-line" rel="noreferrer" target="_blank">
                {link[1]}
              </a>
            ),
          );
        } else {
          nodes.push(link[1]);
        }
      }
    }
    key += 1;
    last = match.index + token.length;
  }

  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

function splitBlocks(markdown: string): string[][] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: string[][] = [];
  let current: string[] = [];

  const flush = () => {
    if (current.length) {
      blocks.push(current);
      current = [];
    }
  };

  for (const line of lines) {
    const isList = /^\s*[-*]\s+/.test(line);
    const isHeading = /^#{2,3}\s+/.test(line);
    const prevList = current.length > 0 && current.every((item) => /^\s*[-*]\s+/.test(item));

    if (!line.trim()) {
      flush();
      continue;
    }
    if (isHeading) {
      flush();
      blocks.push([line]);
      continue;
    }
    if (isList) {
      if (!prevList) flush();
      current.push(line);
      continue;
    }
    if (prevList) flush();
    current.push(line);
  }
  flush();
  return blocks;
}

export function MarkdownBody({ source }: { source: string }) {
  const blocks = splitBlocks(source);

  return (
    <div className="article-body">
      {blocks.map((block, index) => {
        const first = block[0] ?? "";
        if (first.startsWith("## ")) {
          return (
            <h2 key={index} className="font-display">
              {renderInline(first.slice(3))}
            </h2>
          );
        }
        if (first.startsWith("### ")) {
          return (
            <h3 key={index} className="font-display">
              {renderInline(first.slice(4))}
            </h3>
          );
        }
        if (block.every((line) => /^\s*[-*]\s+/.test(line))) {
          return (
            <ul key={index}>
              {block.map((line, itemIndex) => (
                <li key={itemIndex}>{renderInline(line.replace(/^\s*[-*]\s+/, ""))}</li>
              ))}
            </ul>
          );
        }
        return <p key={index}>{renderInline(block.join(" "))}</p>;
      })}
    </div>
  );
}
