import type { MDXComponents } from "mdx/types";
import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

type PropsWithChildren = { children?: ReactNode };

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Headings
    h1: ({ children }: PropsWithChildren) => (
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-8 mb-4">
        {children}
      </h1>
    ),
    h2: ({ children }: PropsWithChildren) => (
      <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mt-8 mb-3 border-b border-border/50 pb-2">
        {children}
      </h2>
    ),
    h3: ({ children }: PropsWithChildren) => (
      <h3 className="text-xl md:text-2xl font-semibold tracking-tight mt-6 mb-3">
        {children}
      </h3>
    ),
    h4: ({ children }: PropsWithChildren) => (
      <h4 className="text-lg font-semibold tracking-tight mt-4 mb-2">
        {children}
      </h4>
    ),

    // Paragraphs and text
    p: ({ children }: PropsWithChildren) => (
      <p className="text-muted-foreground leading-7 mb-4">{children}</p>
    ),
    strong: ({ children }: PropsWithChildren) => (
      <strong className="font-semibold text-foreground">{children}</strong>
    ),
    em: ({ children }: PropsWithChildren) => <em className="italic">{children}</em>,

    // Links
    a: ({ href, children }: { href?: string; children?: ReactNode }) => {
      const isExternal = href?.startsWith("http");
      if (isExternal) {
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
          >
            {children}
          </a>
        );
      }
      return (
        <Link
          href={(href || "#") as Route}
          className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
        >
          {children}
        </Link>
      );
    },

    // Lists
    ul: ({ children }: PropsWithChildren) => (
      <ul className="list-disc list-inside space-y-2 mb-4 text-muted-foreground">
        {children}
      </ul>
    ),
    ol: ({ children }: PropsWithChildren) => (
      <ol className="list-decimal list-inside space-y-2 mb-4 text-muted-foreground">
        {children}
      </ol>
    ),
    li: ({ children }: PropsWithChildren) => <li className="leading-7">{children}</li>,

    // Code
    code: ({ children }: PropsWithChildren) => (
      <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
        {children}
      </code>
    ),
    pre: ({ children }: PropsWithChildren) => (
      <pre className="mb-4 mt-4 overflow-x-auto rounded-lg border border-border/50 bg-muted/50 p-4">
        {children}
      </pre>
    ),

    // Blockquote
    blockquote: ({ children }: PropsWithChildren) => (
      <blockquote className="mt-4 mb-4 border-l-4 border-primary/50 pl-4 italic text-muted-foreground">
        {children}
      </blockquote>
    ),

    // Horizontal rule
    hr: () => <hr className="my-8 border-border/50" />,

    // Table
    table: ({ children }: PropsWithChildren) => (
      <div className="my-6 w-full overflow-x-auto">
        <table className="w-full border-collapse text-sm">{children}</table>
      </div>
    ),
    thead: ({ children }: PropsWithChildren) => (
      <thead className="border-b border-border">{children}</thead>
    ),
    tbody: ({ children }: PropsWithChildren) => <tbody>{children}</tbody>,
    tr: ({ children }: PropsWithChildren) => (
      <tr className="border-b border-border/50">{children}</tr>
    ),
    th: ({ children }: PropsWithChildren) => (
      <th className="px-4 py-2 text-left font-semibold">{children}</th>
    ),
    td: ({ children }: PropsWithChildren) => (
      <td className="px-4 py-2 text-muted-foreground">{children}</td>
    ),

    // Images
    img: ({ src, alt }: { src?: string; alt?: string }) => (
      <figure className="my-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt || ""}
          className="rounded-lg border border-border/50"
        />
        {alt && (
          <figcaption className="mt-2 text-center text-sm text-muted-foreground">
            {alt}
          </figcaption>
        )}
      </figure>
    ),

    ...components,
  };
}
