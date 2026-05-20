import { describe, expect, test } from "bun:test";
import {
	SAFE_AREA_PLATFORM_IDS,
	computeSafeAreaInsets,
	computeSafeAreaRect,
	isPointInSafeArea,
} from "@/canvas/safe-area";

const SHORTS_CANVAS = { width: 1080, height: 1920 };

describe("computeSafeAreaInsets", () => {
	test("youtube-shorts at 1080x1920 has expected top/bottom insets", () => {
		const insets = computeSafeAreaInsets({
			canvasSize: SHORTS_CANVAS,
			platform: "youtube-shorts",
		});
		// top = 1920 * 0.12 = 230.4 → 230
		// bottom = 1920 * 0.20 = 384
		// sides = 1080 * 0.05 = 54
		expect(insets.top).toBe(230);
		expect(insets.bottom).toBe(384);
		expect(insets.left).toBe(54);
		expect(insets.right).toBe(54);
	});

	test("tiktok has smaller top but larger bottom than youtube-shorts", () => {
		const yt = computeSafeAreaInsets({
			canvasSize: SHORTS_CANVAS,
			platform: "youtube-shorts",
		});
		const tt = computeSafeAreaInsets({
			canvasSize: SHORTS_CANVAS,
			platform: "tiktok",
		});
		expect(tt.top).toBeLessThan(yt.top);
		expect(tt.bottom).toBeGreaterThan(yt.bottom);
	});

	test("'all' platform produces conservative (max) insets", () => {
		const all = computeSafeAreaInsets({
			canvasSize: SHORTS_CANVAS,
			platform: "all",
		});
		for (const platform of SAFE_AREA_PLATFORM_IDS) {
			if (platform === "all") continue;
			const specific = computeSafeAreaInsets({
				canvasSize: SHORTS_CANVAS,
				platform,
			});
			expect(all.top).toBeGreaterThanOrEqual(specific.top);
			expect(all.bottom).toBeGreaterThanOrEqual(specific.bottom);
			expect(all.left).toBeGreaterThanOrEqual(specific.left);
			expect(all.right).toBeGreaterThanOrEqual(specific.right);
		}
	});

	test("insets scale with canvas dimensions", () => {
		const small = computeSafeAreaInsets({
			canvasSize: { width: 540, height: 960 },
			platform: "youtube-shorts",
		});
		const large = computeSafeAreaInsets({
			canvasSize: { width: 1080, height: 1920 },
			platform: "youtube-shorts",
		});
		expect(large.top).toBeCloseTo(small.top * 2, 0);
		expect(large.bottom).toBeCloseTo(small.bottom * 2, 0);
	});
});

describe("computeSafeAreaRect", () => {
	test("rectangle for youtube-shorts at 1080x1920", () => {
		const rect = computeSafeAreaRect({
			canvasSize: SHORTS_CANVAS,
			platform: "youtube-shorts",
		});
		expect(rect.x).toBe(54);
		expect(rect.y).toBe(230);
		expect(rect.width).toBe(1080 - 54 - 54);
		expect(rect.height).toBe(1920 - 230 - 384);
	});

	test("width is positive for all platforms at 1080x1920", () => {
		for (const platform of SAFE_AREA_PLATFORM_IDS) {
			const rect = computeSafeAreaRect({
				canvasSize: SHORTS_CANVAS,
				platform,
			});
			expect(rect.width).toBeGreaterThan(0);
			expect(rect.height).toBeGreaterThan(0);
		}
	});
});

describe("isPointInSafeArea", () => {
	test("center of canvas is in safe area", () => {
		expect(
			isPointInSafeArea({
				point: { x: 540, y: 960 },
				canvasSize: SHORTS_CANVAS,
				platform: "youtube-shorts",
			}),
		).toBe(true);
	});

	test("top edge of canvas is outside youtube-shorts safe area", () => {
		expect(
			isPointInSafeArea({
				point: { x: 540, y: 10 },
				canvasSize: SHORTS_CANVAS,
				platform: "youtube-shorts",
			}),
		).toBe(false);
	});

	test("bottom edge of canvas is outside any platform's safe area", () => {
		for (const platform of SAFE_AREA_PLATFORM_IDS) {
			expect(
				isPointInSafeArea({
					point: { x: 540, y: 1910 },
					canvasSize: SHORTS_CANVAS,
					platform,
				}),
			).toBe(false);
		}
	});

	test("point on left edge is outside safe area", () => {
		expect(
			isPointInSafeArea({
				point: { x: 0, y: 960 },
				canvasSize: SHORTS_CANVAS,
				platform: "youtube-shorts",
			}),
		).toBe(false);
	});
});
