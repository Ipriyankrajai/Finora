import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Calendar, Clock, User } from "lucide-react";
import { MDXRemote } from "next-mdx-remote/rsc";

import { getAllPosts, getAllSlugs, getPostBySlug } from "@/lib/blog";
import type { Route } from "next";
import { PageBackground } from "@/components/page-background";
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

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: `${post.title} - Finora Blog`,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author],
    },
  };
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
  const suggestedPosts = allPosts
    .filter((p) => p.slug !== slug)
    .slice(0, 3);

  return (
    <div className="relative min-h-[calc(100svh-4rem)] overflow-hidden">
      <PageBackground variant="centered" />

      {/* Back navigation */}
      <div className="relative z-10 border-b border-border/50">
        <div className="mx-auto max-w-3xl px-6 py-4">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back to Blog
          </Link>
        </div>
      </div>

      {/* Article header */}
      <header className="relative z-10 border-b border-border/50">
        <div className="mx-auto max-w-3xl px-6 py-12 md:py-16">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both">
            <span className="inline-flex px-2.5 py-1 text-[10px] uppercase tracking-wider text-primary border border-primary/20 bg-primary/5 mb-4">
              {post.category}
            </span>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
              {post.title}
            </h1>

            <p className="text-lg text-muted-foreground mb-6">{post.excerpt}</p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
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
          <div className="prose prose-neutral dark:prose-invert max-w-none animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 fill-mode-both">
            <MDXRemote source={post.content} components={components} />
          </div>
        </div>
      </article>

      {/* Suggested Posts */}
      {suggestedPosts.length > 0 && (
        <section className="relative z-10 border-t border-border/50 bg-card/30 backdrop-blur-sm">
          <div className="mx-auto max-w-5xl px-6 py-12">
            <h2 className="text-2xl font-semibold tracking-tight mb-8 animate-in fade-in duration-500 fill-mode-both">
              Continue Reading
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {suggestedPosts.map((suggestedPost, index) => (
                <article
                  key={suggestedPost.slug}
                  className={`group relative border border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-card animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both`}
                  style={{ animationDelay: `${(index + 1) * 100}ms` }}
                >
                  <Link
                    href={`/blog/${suggestedPost.slug}` as Route}
                    className="block p-5 h-full"
                  >
                    <div className="flex flex-col h-full">
                      <span className="inline-flex self-start px-2 py-0.5 text-[10px] uppercase tracking-wider text-primary border border-primary/20 bg-primary/5 mb-3">
                        {suggestedPost.category}
                      </span>
                      <h3 className="font-semibold tracking-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {suggestedPost.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1 line-clamp-2">
                        {suggestedPost.excerpt}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3" />
                          {new Date(suggestedPost.publishedAt).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric" }
                          )}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" />
                          {suggestedPost.readTime}
                        </span>
                      </div>
                      <div className="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity">
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
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-background to-transparent pointer-events-none" />
    </div>
  );
}
