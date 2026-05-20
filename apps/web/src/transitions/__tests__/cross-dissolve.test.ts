import { describe, expect, test } from "bun:test";
import {
	computeTransitionProgress,
	crossDissolveAlpha,
} from "@/transitions/cross-dissolve";

describe("crossDissolveAlpha", () => {
	test("outgoing alpha at progress=0 is 1", () => {
		expect(crossDissolveAlpha({ progress: 0, side: "outgoing" })).toBe(1);
	});

	test("outgoing alpha at progress=1 is 0", () => {
		expect(crossDissolveAlpha({ progress: 1, side: "outgoing" })).toBe(0);
	});

	test("outgoing alpha at progress=0.5 is 0.5 (linear midpoint)", () => {
		expect(crossDissolveAlpha({ progress: 0.5, side: "outgoing" })).toBe(0.5);
	});

	test("incoming alpha at progress=0 is 0", () => {
		expect(crossDissolveAlpha({ progress: 0, side: "incoming" })).toBe(0);
	});

	test("incoming alpha at progress=1 is 1", () => {
		expect(crossDissolveAlpha({ progress: 1, side: "incoming" })).toBe(1);
	});

	test("incoming alpha at progress=0.5 is 0.5", () => {
		expect(crossDissolveAlpha({ progress: 0.5, side: "incoming" })).toBe(0.5);
	});

	test("outgoing + incoming alphas sum to 1 across progress range", () => {
		for (const p of [0, 0.1, 0.25, 0.5, 0.75, 0.9, 1]) {
			const sum =
				crossDissolveAlpha({ progress: p, side: "outgoing" }) +
				crossDissolveAlpha({ progress: p, side: "incoming" });
			expect(sum).toBeCloseTo(1, 5);
		}
	});

	test("clamps progress below 0", () => {
		expect(crossDissolveAlpha({ progress: -0.5, side: "outgoing" })).toBe(1);
		expect(crossDissolveAlpha({ progress: -0.5, side: "incoming" })).toBe(0);
	});

	test("clamps progress above 1", () => {
		expect(crossDissolveAlpha({ progress: 1.5, side: "outgoing" })).toBe(0);
		expect(crossDissolveAlpha({ progress: 1.5, side: "incoming" })).toBe(1);
	});
});

describe("computeTransitionProgress", () => {
	test("returns 0 before overlap window", () => {
		const p = computeTransitionProgress({
			currentTimeSeconds: 0,
			overlapStartSeconds: 5,
			overlapEndSeconds: 7,
		});
		expect(p).toBe(0);
	});

	test("returns 1 after overlap window", () => {
		const p = computeTransitionProgress({
			currentTimeSeconds: 10,
			overlapStartSeconds: 5,
			overlapEndSeconds: 7,
		});
		expect(p).toBe(1);
	});

	test("returns 0 at exact start of overlap", () => {
		const p = computeTransitionProgress({
			currentTimeSeconds: 5,
			overlapStartSeconds: 5,
			overlapEndSeconds: 7,
		});
		expect(p).toBe(0);
	});

	test("returns 1 at exact end of overlap", () => {
		const p = computeTransitionProgress({
			currentTimeSeconds: 7,
			overlapStartSeconds: 5,
			overlapEndSeconds: 7,
		});
		expect(p).toBe(1);
	});

	test("returns 0.5 at exact midpoint", () => {
		const p = computeTransitionProgress({
			currentTimeSeconds: 6,
			overlapStartSeconds: 5,
			overlapEndSeconds: 7,
		});
		expect(p).toBe(0.5);
	});

	test("returns 1 for zero-duration overlap (defensive)", () => {
		const p = computeTransitionProgress({
			currentTimeSeconds: 5,
			overlapStartSeconds: 5,
			overlapEndSeconds: 5,
		});
		expect(p).toBe(1);
	});

	test("returns 1 for inverted overlap window (defensive)", () => {
		const p = computeTransitionProgress({
			currentTimeSeconds: 6,
			overlapStartSeconds: 7,
			overlapEndSeconds: 5,
		});
		expect(p).toBe(1);
	});
});
