import type { Metadata } from "next";

/**
 * Shared OG image configuration
 */
export const ogImage = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "Finora - Finance Clarity",
} as const;

/**
 * Shared Twitter image configuration
 */
export const twitterImage = "/twitter-image";

/**
 * Creates page metadata with shared OG and Twitter images
 */
export function createMetadata(metadata: Metadata): Metadata {
  return {
    ...metadata,
    openGraph: {
      ...metadata.openGraph,
      images: [ogImage],
    },
    twitter: {
      ...metadata.twitter,
      images: [twitterImage],
    },
  };
}
