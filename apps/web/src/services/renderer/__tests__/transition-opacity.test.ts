import { describe, expect, test } from "bun:test";
import { applyTransitionOpacity } from "@/services/renderer/transition-opacity";

const TICKS = 120_000;

describe("applyTransitionOpacity", () => {
	test("no transition → opacity unchanged", () => {
		expect(applyTransitionOpacity({ opacity: 0.8, time: 5 * TICKS })).toBe(0.8);
	});

	test("outgoing fades 1→0 across the window", () => {
		const t = {
			overlapStartTick: 9 * TICKS,
			overlapEndTick: 10 * TICKS,
			side: "outgoing" as const,
		};
		expect(
			applyTransitionOpacity({ opacity: 1, time: 9 * TICKS, transition: t }),
		).toBeCloseTo(1, 5);
		expect(
			applyTransitionOpacity({ opacity: 1, time: 9.5 * TICKS, transition: t }),
		).toBeCloseTo(0.5, 5);
		expect(
			applyTransitionOpacity({ opacity: 1, time: 10 * TICKS, transition: t }),
		).toBeCloseTo(0, 5);
	});

	test("incoming fades 0→1 across the window", () => {
		const t = {
			overlapStartTick: 9 * TICKS,
			overlapEndTick: 10 * TICKS,
			side: "incoming" as const,
		};
		expect(
			applyTransitionOpacity({ opacity: 1, time: 9 * TICKS, transition: t }),
		).toBeCloseTo(0, 5);
		expect(
			applyTransitionOpacity({ opacity: 1, time: 9.5 * TICKS, transition: t }),
		).toBeCloseTo(0.5, 5);
		expect(
			applyTransitionOpacity({ opacity: 1, time: 10 * TICKS, transition: t }),
		).toBeCloseTo(1, 5);
	});

	test("base opacity is preserved as a multiplier", () => {
		const t = {
			overlapStartTick: 0,
			overlapEndTick: 2 * TICKS,
			side: "incoming" as const,
		};
		expect(
			applyTransitionOpacity({ opacity: 0.6, time: 1 * TICKS, transition: t }),
		).toBeCloseTo(0.3, 5);
	});
});
