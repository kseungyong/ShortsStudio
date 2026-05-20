/**
 * Transition framework types — currently only cross-dissolve is implemented.
 * Additional transition kinds (slide, zoom, whip-pan, glitch) require a
 * two-input shader pipeline that is being designed separately
 * (see docs/transitions-architecture.md).
 *
 * A transition is a per-frame computation that, given:
 * - the overlap progress (0 = start of overlap, 1 = end of overlap)
 * - which side of the overlap we're computing for (outgoing or incoming)
 *
 * produces an alpha multiplier in [0, 1] applied to that clip's frame.
 */

export const TRANSITION_KIND_IDS = ["cross-dissolve"] as const;
export type TTransitionKindId = (typeof TRANSITION_KIND_IDS)[number];

export type TTransitionSide = "outgoing" | "incoming";

export interface TTransitionSpec {
	kind: TTransitionKindId;
	/** Duration in seconds of the overlap region where the transition runs. */
	durationSeconds: number;
}
