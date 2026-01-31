import type { MDXComponents } from "mdx/types";
import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

type PropsWithChildren = { children?: ReactNode };

export function useMDXComponents(components: MDXComponents): MDXComponents {
	return {
		// Headings
		h1: ({ children }: PropsWithChildren) => (
			<h1 className="mt-8 mb-4 font-bold text-3xl tracking-tight md:text-4xl">
				{children}
			</h1>
		),
		h2: ({ children }: PropsWithChildren) => (
			<h2 className="mt-8 mb-3 border-border/50 border-b pb-2 font-semibold text-2xl tracking-tight md:text-3xl">
				{children}
			</h2>
		),
		h3: ({ children }: PropsWithChildren) => (
			<h3 className="mt-6 mb-3 font-semibold text-xl tracking-tight md:text-2xl">
				{children}
			</h3>
		),
		h4: ({ children }: PropsWithChildren) => (
			<h4 className="mt-4 mb-2 font-semibold text-lg tracking-tight">
				{children}
			</h4>
		),

		// Paragraphs and text
		p: ({ children }: PropsWithChildren) => (
			<p className="mb-4 text-muted-foreground leading-7">{children}</p>
		),
		strong: ({ children }: PropsWithChildren) => (
			<strong className="font-semibold text-foreground">{children}</strong>
		),
		em: ({ children }: PropsWithChildren) => (
			<em className="italic">{children}</em>
		),

		// Links
		a: ({ href, children }: { href?: string; children?: ReactNode }) => {
			const isExternal = href?.startsWith("http");
			if (isExternal) {
				return (
					<a
						className="text-primary underline underline-offset-4 transition-colors hover:text-primary/80"
						href={href}
						rel="noopener noreferrer"
						target="_blank"
					>
						{children}
					</a>
				);
			}
			return (
				<Link
					className="text-primary underline underline-offset-4 transition-colors hover:text-primary/80"
					href={(href || "#") as Route}
				>
					{children}
				</Link>
			);
		},

		// Lists
		ul: ({ children }: PropsWithChildren) => (
			<ul className="mb-4 list-inside list-disc space-y-2 text-muted-foreground">
				{children}
			</ul>
		),
		ol: ({ children }: PropsWithChildren) => (
			<ol className="mb-4 list-inside list-decimal space-y-2 text-muted-foreground">
				{children}
			</ol>
		),
		li: ({ children }: PropsWithChildren) => (
			<li className="leading-7">{children}</li>
		),

		// Code
		code: ({ children }: PropsWithChildren) => (
			<code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
				{children}
			</code>
		),
		pre: ({ children }: PropsWithChildren) => (
			<pre className="mt-4 mb-4 overflow-x-auto rounded-lg border border-border/50 bg-muted/50 p-4">
				{children}
			</pre>
		),

		// Blockquote
		blockquote: ({ children }: PropsWithChildren) => (
			<blockquote className="mt-4 mb-4 border-primary/50 border-l-4 pl-4 text-muted-foreground italic">
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
			<thead className="border-border border-b">{children}</thead>
		),
		tbody: ({ children }: PropsWithChildren) => <tbody>{children}</tbody>,
		tr: ({ children }: PropsWithChildren) => (
			<tr className="border-border/50 border-b">{children}</tr>
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
					alt={alt || ""}
					className="rounded-lg border border-border/50"
					src={src}
				/>
				{alt && (
					<figcaption className="mt-2 text-center text-muted-foreground text-sm">
						{alt}
					</figcaption>
				)}
			</figure>
		),

		...components,
	};
}
