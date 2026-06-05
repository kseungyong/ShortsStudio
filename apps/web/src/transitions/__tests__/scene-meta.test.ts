import { describe, expect, test } from "bun:test";
import { computeTransitionNodeMeta } from "@/transitions/scene-meta";

const TICKS = 120_000;

type El = {
	id: string;
	startTime: number;
	duration: number;
	transition?: { kind: "cross-dissolve"; durationSeconds: number };
};

function el(p: El): El {
	return p;
}

describe("computeTransitionNodeMeta", () => {
	test("no transitions → empty map", () => {
		const meta = computeTransitionNodeMeta({
			elements: [
				el({ id: "a", startTime: 0, duration: 10 * TICKS }),
				el({ id: "b", startTime: 10 * TICKS, duration: 10 * TICKS }),
			],
		});
		expect(meta.size).toBe(0);
	});

	test("single pair → outgoing + incoming entries with shared window", () => {
		const meta = computeTransitionNodeMeta({
			elements: [
				el({
					id: "a",
					startTime: 0,
					duration: 10 * TICKS,
					transition: { kind: "cross-dissolve", durationSeconds: 1 },
				}),
				el({ id: "b", startTime: 10 * TICKS, duration: 10 * TICKS }),
			],
		});
		const a = meta.get("a");
		const b = meta.get("b");
		expect(a).toBeDefined();
		expect(b).toBeDefined();
		expect(a?.transition.overlapStartTick).toBe(9 * TICKS);
		expect(a?.transition.overlapEndTick).toBe(10 * TICKS);
		expect(a?.transition.side).toBe("outgoing");
		expect(a?.timeOffsetShiftTicks).toBe(0);
		expect(b?.transition.overlapStartTick).toBe(9 * TICKS);
		expect(b?.transition.overlapEndTick).toBe(10 * TICKS);
		expect(b?.transition.side).toBe("incoming");
		expect(b?.timeOffsetShiftTicks).toBe(-1 * TICKS);
	});

	test("transition on last element (no next) → ignored", () => {
		const meta = computeTransitionNodeMeta({
			elements: [
				el({ id: "a", startTime: 0, duration: 10 * TICKS }),
				el({
					id: "b",
					startTime: 10 * TICKS,
					duration: 10 * TICKS,
					transition: { kind: "cross-dissolve", durationSeconds: 1 },
				}),
			],
		});
		expect(meta.has("b")).toBe(false);
		expect(meta.size).toBe(0);
	});

	test("duration clamped to the shorter of the two clips", () => {
		const meta = computeTransitionNodeMeta({
			elements: [
				el({
					id: "a",
					startTime: 0,
					duration: Math.round(0.5 * TICKS),
					transition: { kind: "cross-dissolve", durationSeconds: 1 },
				}),
				el({ id: "b", startTime: Math.round(0.5 * TICKS), duration: 10 * TICKS }),
			],
		});
		const a = meta.get("a");
		expect(a?.transition.overlapStartTick).toBe(0);
		expect(a?.transition.overlapEndTick).toBe(Math.round(0.5 * TICKS));
		expect(meta.get("b")?.timeOffsetShiftTicks).toBe(-Math.round(0.5 * TICKS));
	});
});
