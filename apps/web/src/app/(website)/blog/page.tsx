import { ArrowRight, Calendar, Clock } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { PageBackground } from "@/components/page-background";
import { Button } from "@/components/ui/button";
import { type BlogPostMeta, getAllPosts } from "@/lib/blog";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
	title: "Blog",
	description:
		"Financial tips, guides, and insights from Finora. Learn how to manage your money better with our expert articles on budgeting, saving, and investing.",
	openGraph: {
		title: "Blog - Finora",
		description:
			"Financial tips, guides, and insights to help you manage your money better.",
	},
});

function BlogCard({
	post,
	featured = false,
	className,
}: {
	post: BlogPostMeta;
	featured?: boolean;
	className?: string;
}) {
	return (
		<article
			className={`group fade-in slide-in-from-bottom-4 relative animate-in border border-border/50 bg-card/50 fill-mode-both backdrop-blur-sm transition-all duration-700 hover:border-primary/30 hover:bg-card ${
				featured ? "md:col-span-2 md:row-span-2" : ""
			} ${className}`}
		>
			<Link className="block h-full p-6" href={`/blog/${post.slug}` as Route}>
				<div className="flex h-full flex-col">
					{/* Category badge */}
					<div className="mb-4">
						<span className="inline-flex border border-primary/20 bg-primary/5 px-2.5 py-1 text-[10px] text-primary uppercase tracking-wider">
							{post.category}
						</span>
					</div>

					{/* Title */}
					<h2
						className={`mb-3 font-semibold tracking-tight transition-colors group-hover:text-primary ${
							featured ? "text-2xl md:text-3xl" : "text-lg"
						}`}
					>
						{post.title}
					</h2>

					{/* Excerpt */}
					<p
						className={`mb-6 flex-1 text-muted-foreground leading-relaxed ${
							featured ? "text-base" : "text-sm"
						}`}
					>
						{post.excerpt}
					</p>

					{/* Meta */}
					<div className="flex items-center gap-4 text-muted-foreground text-xs">
						<span className="flex items-center gap-1.5">
							<Calendar className="size-3.5" />
							{new Date(post.publishedAt).toLocaleDateString("en-US", {
								month: "short",
								day: "numeric",
								year: "numeric",
							})}
						</span>
						<span className="flex items-center gap-1.5">
							<Clock className="size-3.5" />
							{post.readTime}
						</span>
					</div>

					{/* Arrow indicator */}
					<div className="absolute right-6 bottom-6 opacity-0 transition-opacity group-hover:opacity-100">
						<ArrowRight className="size-4 text-primary" />
					</div>
				</div>
			</Link>
		</article>
	);
}

export default function BlogPage() {
	const posts = getAllPosts();
	const featuredPost = posts.find((post) => post.featured);
	const otherPosts = posts.filter((post) => !post.featured);

	return (
		<div className="relative min-h-[calc(100svh-4rem)] overflow-hidden">
			<PageBackground variant="centered" />

			{/* Header */}
			<section className="relative z-10 border-border/50 border-b">
				<div className="mx-auto max-w-5xl px-6 py-16 md:py-24">
					<div className="max-w-2xl">
						<span className="fade-in slide-in-from-top-4 mb-6 inline-flex animate-in border border-primary/20 bg-primary/5 fill-mode-both px-3 py-1.5 text-[10px] text-primary uppercase tracking-[0.3em] duration-700">
							Blog
						</span>
						<h1 className="fade-in slide-in-from-bottom-4 mb-4 animate-in fill-mode-both font-bold text-4xl tracking-tight delay-100 duration-700 md:text-5xl">
							Financial <span className="shimmer-text">Insights</span>
						</h1>
						<p className="fade-in slide-in-from-bottom-4 animate-in fill-mode-both text-lg text-muted-foreground delay-200 duration-700">
							Tips, guides, and strategies to help you take control of your
							finances.
						</p>
					</div>
				</div>
			</section>

			{/* Posts Grid */}
			<section className="relative z-10 mx-auto max-w-5xl px-6 py-12">
				{posts.length === 0 ? (
					<div className="py-12 text-center">
						<p className="text-muted-foreground">
							No posts yet. Check back soon!
						</p>
					</div>
				) : (
					<div className="grid gap-6 md:grid-cols-2">
						{featuredPost && (
							<BlogCard className="delay-300" featured post={featuredPost} />
						)}
						{otherPosts.map((post, index) => (
							<BlogCard
								className={
									index === 0
										? "delay-500"
										: index === 1
											? "delay-700"
											: "delay-1000"
								}
								key={post.slug}
								post={post}
							/>
						))}
					</div>
				)}
			</section>

			{/* Newsletter CTA */}
			<section className="relative z-10 border-border/50 border-t bg-card/30 backdrop-blur-sm">
				<div className="mx-auto max-w-5xl px-6 py-16">
					<div className="fade-in mx-auto max-w-xl animate-in fill-mode-both text-center duration-500">
						<h2 className="mb-4 font-semibold text-2xl tracking-tight">
							Stay Updated
						</h2>
						<p className="mb-6 text-muted-foreground">
							Get the latest financial tips and Finora updates delivered to your
							inbox.
						</p>
						<div className="mx-auto flex max-w-md gap-3">
							<input
								className="h-11 flex-1 rounded-md border border-border bg-background/50 px-4 text-sm backdrop-blur-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
								placeholder="Enter your email"
								type="email"
							/>
							<Button className="bg-linear-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-500 hover:to-emerald-400">
								Subscribe
							</Button>
						</div>
					</div>
				</div>
			</section>

			{/* Bottom gradient fade */}
			<div className="pointer-events-none absolute right-0 bottom-0 left-0 h-32 bg-linear-to-t from-background to-transparent" />
		</div>
	);
}
