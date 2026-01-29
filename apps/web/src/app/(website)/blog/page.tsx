import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";

import { ArrowRight, Calendar, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Blog - Finora",
  description: "Financial tips, guides, and insights to help you manage your money better.",
};

const blogPosts = [
  {
    slug: "getting-started-expense-tracking",
    title: "Getting Started with Expense Tracking",
    excerpt:
      "Learn how to effectively track your expenses and gain insights into your spending habits with our comprehensive guide.",
    category: "Guides",
    readTime: "5 min read",
    publishedAt: "2024-01-15",
    featured: true,
  },
  {
    slug: "budget-tips-2024",
    title: "10 Budgeting Tips for 2024",
    excerpt:
      "Start the new year right with these proven budgeting strategies that will help you save more and stress less.",
    category: "Tips",
    readTime: "7 min read",
    publishedAt: "2024-01-10",
    featured: false,
  },
  {
    slug: "understanding-loan-amortization",
    title: "Understanding Loan Amortization",
    excerpt:
      "A deep dive into how loan payments work and how you can use this knowledge to pay off debt faster.",
    category: "Education",
    readTime: "8 min read",
    publishedAt: "2024-01-05",
    featured: false,
  },
  {
    slug: "emergency-fund-basics",
    title: "Building Your Emergency Fund",
    excerpt:
      "Why everyone needs an emergency fund and practical steps to build one, even on a tight budget.",
    category: "Guides",
    readTime: "6 min read",
    publishedAt: "2024-01-01",
    featured: false,
  },
];

function BlogCard({
  post,
  featured = false,
}: {
  post: (typeof blogPosts)[0];
  featured?: boolean;
}) {
  return (
    <article
      className={`group relative border border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:bg-card ${
        featured ? "md:col-span-2 md:row-span-2" : ""
      }`}
    >
      <Link href={`/blog/${post.slug}` as Route} className="block p-6 h-full">
        <div className="flex flex-col h-full">
          {/* Category badge */}
          <div className="mb-4">
            <span className="inline-flex px-2.5 py-1 text-[10px] uppercase tracking-wider text-primary border border-primary/20 bg-primary/5">
              {post.category}
            </span>
          </div>

          {/* Title */}
          <h2
            className={`font-semibold tracking-tight mb-3 group-hover:text-primary transition-colors ${
              featured ? "text-2xl md:text-3xl" : "text-lg"
            }`}
          >
            {post.title}
          </h2>

          {/* Excerpt */}
          <p
            className={`text-muted-foreground leading-relaxed mb-6 flex-1 ${
              featured ? "text-base" : "text-sm"
            }`}
          >
            {post.excerpt}
          </p>

          {/* Meta */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
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
          <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowRight className="size-4 text-primary" />
          </div>
        </div>
      </Link>
    </article>
  );
}

export default function BlogPage() {
  const featuredPost = blogPosts.find((post) => post.featured);
  const otherPosts = blogPosts.filter((post) => !post.featured);

  return (
    <div className="min-h-[calc(100svh-4rem)]">
      {/* Header */}
      <section className="border-b border-border/50">
        <div className="mx-auto max-w-5xl px-6 py-16 md:py-24">
          <div className="max-w-2xl">
            <span className="inline-flex px-3 py-1.5 text-[10px] uppercase tracking-[0.3em] text-primary border border-primary/20 bg-primary/5 mb-6">
              Blog
            </span>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Financial Insights
            </h1>
            <p className="text-lg text-muted-foreground">
              Tips, guides, and strategies to help you take control of your finances.
            </p>
          </div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="grid md:grid-cols-2 gap-6">
          {featuredPost && <BlogCard post={featuredPost} featured />}
          {otherPosts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>

        {/* Load more */}
        <div className="mt-12 text-center">
          <Button variant="outline" size="lg">
            Load More Posts
          </Button>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="border-t border-border/50 bg-card/30">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-2xl font-semibold tracking-tight mb-4">
              Stay Updated
            </h2>
            <p className="text-muted-foreground mb-6">
              Get the latest financial tips and Finora updates delivered to your inbox.
            </p>
            <div className="flex gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 h-11 px-4 bg-background border border-border rounded-md text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <Button className="bg-linear-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
