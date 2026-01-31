import { ArrowLeft, ArrowRight, Calendar, Clock, User } from "lucide-react";
import type { Metadata, Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { PageBackground } from "@/components/page-background";
import { getAllPosts, getAllSlugs, getPostBySlug } from "@/lib/blog";
import { createMetadata } from "@/lib/metadata";
import { useMDXComponents } from "../../../../../mdx-components";

interface Props {
	params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
	const slugs = getAllSlugs();
	return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { slug } = await params;
	const post = getPostBySlug(slug);

	if (!post) {
		return {
			title: "Post Not Found",
		};
	}

	return createMetadata({
		title: post.title,
		description: post.excerpt,
		openGraph: {
			title: `${post.title} - Finora Blog`,
			description: post.excerpt,
			type: "article",
			publishedTime: post.publishedAt,
			authors: [post.author],
		},
	});
}

export default async function BlogPostPage({ params }: Props) {
	const { slug } = await params;
	const post = getPostBySlug(slug);

	if (!post) {
		notFound();
	}

	const components = useMDXComponents({});

	// Get suggested posts (exclude current post, limit to 3)
	const allPosts = getAllPosts();
	const suggestedPosts = allPosts.filter((p) => p.slug !== slug).slice(0, 3);

	return (
		<div className="relative min-h-[calc(100svh-4rem)] overflow-hidden">
			<PageBackground variant="centered" />

			{/* Back navigation */}
			<div className="relative z-10 border-border/50 border-b">
				<div className="mx-auto max-w-3xl px-6 py-4">
					<Link
						className="inline-flex items-center gap-2 text-muted-foreground text-sm transition-colors hover:text-foreground"
						href="/blog"
					>
						<ArrowLeft className="size-4" />
						Back to Blog
					</Link>
				</div>
			</div>

			{/* Article header */}
			<header className="relative z-10 border-border/50 border-b">
				<div className="mx-auto max-w-3xl px-6 py-12 md:py-16">
					<div className="fade-in slide-in-from-bottom-4 animate-in fill-mode-both duration-700">
						<span className="mb-4 inline-flex border border-primary/20 bg-primary/5 px-2.5 py-1 text-[10px] text-primary uppercase tracking-wider">
							{post.category}
						</span>

						<h1 className="mb-6 font-bold text-3xl tracking-tight md:text-4xl lg:text-5xl">
							{post.title}
						</h1>

						<p className="mb-6 text-lg text-muted-foreground">{post.excerpt}</p>

						<div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm">
							<span className="flex items-center gap-1.5">
								<User className="size-4" />
								{post.author}
							</span>
							<span className="flex items-center gap-1.5">
								<Calendar className="size-4" />
								{new Date(post.publishedAt).toLocaleDateString("en-US", {
									month: "long",
									day: "numeric",
									year: "numeric",
								})}
							</span>
							<span className="flex items-center gap-1.5">
								<Clock className="size-4" />
								{post.readTime}
							</span>
						</div>
					</div>
				</div>
			</header>

			{/* Article content */}
			<article className="relative z-10">
				<div className="mx-auto max-w-3xl px-6 py-12">
					<div className="prose prose-neutral dark:prose-invert fade-in slide-in-from-bottom-4 max-w-none animate-in fill-mode-both delay-200 duration-700">
						<MDXRemote
							components={components}
							options={{
								mdxOptions: {
									remarkPlugins: [remarkGfm],
								},
							}}
							source={post.content}
						/>
					</div>
				</div>
			</article>

			{/* Suggested Posts */}
			{suggestedPosts.length > 0 && (
				<section className="relative z-10 border-border/50 border-t bg-card/30 backdrop-blur-sm">
					<div className="mx-auto max-w-5xl px-6 py-12">
						<h2 className="fade-in mb-8 animate-in fill-mode-both font-semibold text-2xl tracking-tight duration-500">
							Continue Reading
						</h2>
						<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
							{suggestedPosts.map((suggestedPost, index) => (
								<article
									className={
										"group fade-in slide-in-from-bottom-4 relative animate-in border border-border/50 bg-card/50 fill-mode-both backdrop-blur-sm transition-all duration-700 hover:border-primary/30 hover:bg-card"
									}
									key={suggestedPost.slug}
									style={{ animationDelay: `${(index + 1) * 100}ms` }}
								>
									<Link
										className="block h-full p-5"
										href={`/blog/${suggestedPost.slug}` as Route}
									>
										<div className="flex h-full flex-col">
											<span className="mb-3 inline-flex self-start border border-primary/20 bg-primary/5 px-2 py-0.5 text-[10px] text-primary uppercase tracking-wider">
												{suggestedPost.category}
											</span>
											<h3 className="mb-2 line-clamp-2 font-semibold tracking-tight transition-colors group-hover:text-primary">
												{suggestedPost.title}
											</h3>
											<p className="mb-4 line-clamp-2 flex-1 text-muted-foreground text-sm leading-relaxed">
												{suggestedPost.excerpt}
											</p>
											<div className="flex items-center gap-3 text-muted-foreground text-xs">
												<span className="flex items-center gap-1">
													<Calendar className="size-3" />
													{new Date(
														suggestedPost.publishedAt
													).toLocaleDateString("en-US", {
														month: "short",
														day: "numeric",
													})}
												</span>
												<span className="flex items-center gap-1">
													<Clock className="size-3" />
													{suggestedPost.readTime}
												</span>
											</div>
											<div className="absolute right-5 bottom-5 opacity-0 transition-opacity group-hover:opacity-100">
												<ArrowRight className="size-4 text-primary" />
											</div>
										</div>
									</Link>
								</article>
							))}
						</div>
					</div>
				</section>
			)}

			{/* Bottom gradient fade */}
			<div className="pointer-events-none absolute right-0 bottom-0 left-0 h-32 bg-linear-to-t from-background to-transparent" />
		</div>
	);
}
