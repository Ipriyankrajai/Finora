import fs from "fs";
import matter from "gray-matter";
import path from "path";
import readingTime from "reading-time";

const BLOG_DIR = path.join(process.cwd(), "content/blog");

export interface BlogPost {
	slug: string;
	title: string;
	excerpt: string;
	category: string;
	publishedAt: string;
	updatedAt?: string;
	author: string;
	featured: boolean;
	readTime: string;
	content: string;
}

export interface BlogPostMeta {
	slug: string;
	title: string;
	excerpt: string;
	category: string;
	publishedAt: string;
	author: string;
	featured: boolean;
	readTime: string;
}

function parseFrontmatter(fileContent: string, slug: string): BlogPost {
	const { data, content } = matter(fileContent);
	const stats = readingTime(content);

	return {
		slug,
		title: data.title || "Untitled",
		excerpt: data.excerpt || "",
		category: data.category || "General",
		publishedAt: data.publishedAt || new Date().toISOString().split("T")[0],
		updatedAt: data.updatedAt,
		author: data.author || "Finora Team",
		featured: data.featured,
		readTime: stats.text,
		content,
	};
}

export function getAllPosts(): BlogPostMeta[] {
	if (!fs.existsSync(BLOG_DIR)) {
		return [];
	}

	const files = fs.readdirSync(BLOG_DIR);
	const posts = files
		.filter((file) => file.endsWith(".mdx"))
		.map((file) => {
			const slug = file.replace(/\.mdx$/, "");
			const filePath = path.join(BLOG_DIR, file);
			const fileContent = fs.readFileSync(filePath, "utf-8");
			const post = parseFrontmatter(fileContent, slug);

			return {
				slug: post.slug,
				title: post.title,
				excerpt: post.excerpt,
				category: post.category,
				publishedAt: post.publishedAt,
				author: post.author,
				featured: post.featured,
				readTime: post.readTime,
			};
		})
		.sort(
			(a, b) =>
				new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
		);

	return posts;
}

export function getPostBySlug(slug: string): BlogPost | null {
	const filePath = path.join(BLOG_DIR, `${slug}.mdx`);

	if (!fs.existsSync(filePath)) {
		return null;
	}

	const fileContent = fs.readFileSync(filePath, "utf-8");
	return parseFrontmatter(fileContent, slug);
}

export function getAllSlugs(): string[] {
	if (!fs.existsSync(BLOG_DIR)) {
		return [];
	}

	return fs
		.readdirSync(BLOG_DIR)
		.filter((file) => file.endsWith(".mdx"))
		.map((file) => file.replace(/\.mdx$/, ""));
}
