import type { TCanvasSize } from "@/project/types";

/**
 * Safe-area guides for vertical short-form video. Different platforms
 * overlay UI in different regions; this module returns the inset
 * rectangle that text/captions should stay within.
 *
 * Insets are expressed as ratios of canvas height (for top/bottom) and
 * canvas width (for left/right) so they scale to any 9:16 resolution.
 *
 * Sources:
 *   - YouTube Shorts: top 12% (channel header), bottom 20% (description + like/share UI)
 *   - TikTok: top 7%, bottom 25% (caption + UI cluster)
 *   - Reels: top 8%, bottom 22%
 *
 * These are conservative estimates. Platform UIs evolve; treat as guidance.
 */

export const SAFE_AREA_PLATFORM_IDS = [
	"youtube-shorts",
	"tiktok",
	"reels",
	"all",
] as const;

export type TSafeAreaPlatformId = (typeof SAFE_AREA_PLATFORM_IDS)[number];

export interface TSafeAreaInsets {
	/** Pixels from top edge. */
	top: number;
	/** Pixels from bottom edge. */
	bottom: number;
	/** Pixels from left edge. */
	left: number;
	/** Pixels from right edge. */
	right: number;
}

/**
 * Inset ratios per platform. Each ratio is relative to the corresponding
 * canvas dimension (top/bottom relative to height, left/right relative to width).
 */
const PLATFORM_INSET_RATIOS: Record<
	TSafeAreaPlatformId,
	{ topRatio: number; bottomRatio: number; sideRatio: number }
> = {
	"youtube-shorts": { topRatio: 0.12, bottomRatio: 0.20, sideRatio: 0.05 },
	tiktok: { topRatio: 0.07, bottomRatio: 0.25, sideRatio: 0.05 },
	reels: { topRatio: 0.08, bottomRatio: 0.22, sideRatio: 0.05 },
	all: { topRatio: 0.12, bottomRatio: 0.25, sideRatio: 0.05 }, // union of worst cases
};

export function computeSafeAreaInsets({
	canvasSize,
	platform,
}: {
	canvasSize: TCanvasSize;
	platform: TSafeAreaPlatformId;
}): TSafeAreaInsets {
	const ratios = PLATFORM_INSET_RATIOS[platform];
	return {
		top: Math.round(canvasSize.height * ratios.topRatio),
		bottom: Math.round(canvasSize.height * ratios.bottomRatio),
		left: Math.round(canvasSize.width * ratios.sideRatio),
		right: Math.round(canvasSize.width * ratios.sideRatio),
	};
}

export interface TSafeAreaRect {
	/** Pixel coordinate of top-left corner (x, y). */
	x: number;
	y: number;
	width: number;
	height: number;
}

/**
 * Compute the rectangle inside which content should be placed.
 */
export function computeSafeAreaRect({
	canvasSize,
	platform,
}: {
	canvasSize: TCanvasSize;
	platform: TSafeAreaPlatformId;
}): TSafeAreaRect {
	const insets = computeSafeAreaInsets({ canvasSize, platform });
	return {
		x: insets.left,
		y: insets.top,
		width: canvasSize.width - insets.left - insets.right,
		height: canvasSize.height - insets.top - insets.bottom,
	};
}

/**
 * Test whether a point lies within the safe area for the given platform.
 */
export function isPointInSafeArea({
	point,
	canvasSize,
	platform,
}: {
	point: { x: number; y: number };
	canvasSize: TCanvasSize;
	platform: TSafeAreaPlatformId;
}): boolean {
	const rect = computeSafeAreaRect({ canvasSize, platform });
	return (
		point.x >= rect.x &&
		point.x <= rect.x + rect.width &&
		point.y >= rect.y &&
		point.y <= rect.y + rect.height
	);
}
