import type { TTransitionSide } from "./types";

/**
 * Compute alpha multiplier for one side of a cross-dissolve.
 *
 * progress: 0 at start of overlap, 1 at end of overlap.
 *
 * The outgoing clip fades from alpha 1 at progress=0 to alpha 0 at progress=1.
 * The incoming clip fades from alpha 0 at progress=0 to alpha 1 at progress=1.
 *
 * Linear ramp — simple and visually neutral. Non-linear ease curves can be
 * added as parameters later if needed.
 */
export function crossDissolveAlpha({
	progress,
	side,
}: {
	progress: number;
	side: TTransitionSide;
}): number {
	const clamped = Math.min(1, Math.max(0, progress));
	return side === "outgoing" ? 1 - clamped : clamped;
}

/**
 * Given the overlap window and current playback time, compute progress
 * in [0, 1]. Returns 0 if time precedes the window, 1 if it follows it.
 */
export function computeTransitionProgress({
	currentTimeSeconds,
	overlapStartSeconds,
	overlapEndSeconds,
}: {
	currentTimeSeconds: number;
	overlapStartSeconds: number;
	overlapEndSeconds: number;
}): number {
	if (overlapEndSeconds <= overlapStartSeconds) return 1;
	if (currentTimeSeconds <= overlapStartSeconds) return 0;
	if (currentTimeSeconds >= overlapEndSeconds) return 1;
	return (
		(currentTimeSeconds - overlapStartSeconds) /
		(overlapEndSeconds - overlapStartSeconds)
	);
}
