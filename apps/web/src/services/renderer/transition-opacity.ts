import {
	computeTransitionProgress,
	crossDissolveAlpha,
} from "@/transitions/cross-dissolve";
import type { TTransitionSide } from "@/transitions/types";

/**
 * Multiply a resolved opacity by the cross-dissolve alpha for the current time.
 * Returns opacity unchanged when there is no transition. computeTransitionProgress
 * is ratio-only, so ticks are passed into its "seconds"-named params unit-free.
 */
export function applyTransitionOpacity({
	opacity,
	time,
	transition,
}: {
	opacity: number;
	time: number;
	transition?: {
		overlapStartTick: number;
		overlapEndTick: number;
		side: TTransitionSide;
	};
}): number {
	if (!transition) return opacity;
	const progress = computeTransitionProgress({
		currentTimeSeconds: time,
		overlapStartSeconds: transition.overlapStartTick,
		overlapEndSeconds: transition.overlapEndTick,
	});
	return opacity * crossDissolveAlpha({ progress, side: transition.side });
}
