import type { TTransitionSide, TTransitionSpec } from "@/transitions/types";

const TICKS_PER_SECOND = 120_000;

export interface TransitionNodeMeta {
	/** Ticks to add to the node's timeOffset. 0 for outgoing, -d for incoming. */
	timeOffsetShiftTicks: number;
	transition: {
		overlapStartTick: number;
		overlapEndTick: number;
		side: TTransitionSide;
	};
}

interface MetaElement {
	id: string;
	startTime: number;
	duration: number;
	transition?: TTransitionSpec;
}

/**
 * For each adjacent pair (cur, next) where `cur.transition` is set, emit
 * transition metadata for BOTH the outgoing (cur) and incoming (next) render
 * nodes. The incoming node is pulled back by the (clamped) transition duration
 * so the two node time-windows overlap and cross-dissolve can render.
 *
 * MVP limitation: pulling `next` back ends it `d` earlier in render time. Exact
 * for a single pair or the last two clips; a middle-of-chain pair leaves a
 * `d`-tick gap before the following clip. Full timeline-axis compression is a
 * later wave (docs/transitions-architecture.md).
 */
export function computeTransitionNodeMeta({
	elements,
}: {
	elements: MetaElement[];
}): Map<string, TransitionNodeMeta> {
	const meta = new Map<string, TransitionNodeMeta>();

	for (let i = 0; i < elements.length - 1; i++) {
		const cur = elements[i];
		const next = elements[i + 1];
		const spec = cur.transition;
		if (!spec) continue;

		const requestedTicks = Math.round(spec.durationSeconds * TICKS_PER_SECOND);
		const durationTicks = Math.max(
			0,
			Math.min(requestedTicks, cur.duration, next.duration),
		);
		if (durationTicks === 0) continue;

		const overlapEndTick = cur.startTime + cur.duration;
		const overlapStartTick = overlapEndTick - durationTicks;

		meta.set(cur.id, {
			timeOffsetShiftTicks: 0,
			transition: { overlapStartTick, overlapEndTick, side: "outgoing" },
		});
		meta.set(next.id, {
			timeOffsetShiftTicks: -durationTicks,
			transition: { overlapStartTick, overlapEndTick, side: "incoming" },
		});
	}

	return meta;
}
