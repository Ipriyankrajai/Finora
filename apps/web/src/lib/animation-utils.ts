/**
 * Animation delay utilities for consistent staggered animations
 */

const ANIMATION_DELAYS = ["delay-100", "delay-200", "delay-300", "delay-500"];
const STAT_DELAYS = ["delay-300", "delay-500", "delay-700"];
const BLOG_DELAYS = ["delay-500", "delay-700", "delay-1000"];

export function getAnimationDelay(
	index: number,
	delays = ANIMATION_DELAYS
): string {
	return delays[index] ?? delays.at(-1) ?? "";
}

export function getStatDelay(index: number): string {
	return getAnimationDelay(index, STAT_DELAYS);
}

export function getBlogDelay(index: number): string {
	return getAnimationDelay(index, BLOG_DELAYS);
}
