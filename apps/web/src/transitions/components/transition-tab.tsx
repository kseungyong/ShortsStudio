import { useRef } from "react";
import { useEditor } from "@/editor/use-editor";
import { NumberField } from "@/components/ui/number-field";
import { Switch } from "@/components/ui/switch";
import { HugeiconsIcon } from "@hugeicons/react";
import { TransitionTopIcon } from "@hugeicons/core-free-icons";
import type { ImageElement, VideoElement } from "@/timeline";
import type { TTransitionSpec } from "@/transitions/types";
import {
	Section,
	SectionContent,
	SectionField,
	SectionFields,
	SectionHeader,
	SectionTitle,
} from "@/components/section";
import { usePropertyDraft } from "@/components/editor/panels/properties/hooks/use-property-draft";
import {
	clamp,
	formatNumberForDisplay,
	getFractionDigitsForStep,
	snapToStep,
} from "@/utils/math";

const DEFAULT_TRANSITION_SECONDS = 0.5;
const MIN_TRANSITION_SECONDS = 0.1;
const MAX_TRANSITION_SECONDS = 3;
const TRANSITION_STEP = 0.1;
const TRANSITION_FRACTION_DIGITS = getFractionDigitsForStep({
	step: TRANSITION_STEP,
});

function clampDuration({ seconds }: { seconds: number }): number {
	return clamp({
		value: seconds,
		min: MIN_TRANSITION_SECONDS,
		max: MAX_TRANSITION_SECONDS,
	});
}

function secondsToDisplay({ seconds }: { seconds: number }): string {
	return formatNumberForDisplay({
		value: seconds,
		fractionDigits: TRANSITION_FRACTION_DIGITS,
	});
}

function parseDurationInput({ input }: { input: string }): number | null {
	const parsed = parseFloat(input);
	if (Number.isNaN(parsed)) return null;
	return clampDuration({
		seconds: snapToStep({ value: parsed, step: TRANSITION_STEP }),
	});
}

function buildTransition({
	durationSeconds,
}: {
	durationSeconds: number;
}): TTransitionSpec {
	return {
		kind: "cross-dissolve",
		durationSeconds: clampDuration({ seconds: durationSeconds }),
	};
}

export function TransitionTab({
	element,
	trackId,
}: {
	element: VideoElement | ImageElement;
	trackId: string;
}) {
	const editor = useEditor();
	const enabled = element.transition?.kind === "cross-dissolve";
	const durationSeconds = clampDuration({
		seconds: element.transition?.durationSeconds ?? DEFAULT_TRANSITION_SECONDS,
	});
	const pendingDurationRef = useRef(durationSeconds);

	const commitTransition = ({
		transition,
	}: {
		transition?: TTransitionSpec;
	}) => {
		editor.timeline.updateElementTransition({
			trackId,
			elementId: element.id,
			transition,
		});
	};

	const durationDraft = usePropertyDraft({
		displayValue: secondsToDisplay({ seconds: durationSeconds }),
		parse: (input) => parseDurationInput({ input }),
		onPreview: (nextSeconds) => {
			pendingDurationRef.current = nextSeconds;
			editor.timeline.previewElements({
				updates: [
					{
						trackId,
						elementId: element.id,
						updates: {
							transition: buildTransition({ durationSeconds: nextSeconds }),
						},
					},
				],
			});
		},
		onCommit: () => {
			commitTransition({
				transition: buildTransition({
					durationSeconds: pendingDurationRef.current,
				}),
			});
		},
	});

	return (
		<Section collapsible sectionKey={`${element.id}:transition`}>
			<SectionHeader>
				<SectionTitle>Transition</SectionTitle>
			</SectionHeader>
			<SectionContent>
				<SectionFields>
					<div className="flex items-center justify-between">
						<span className="text-sm">Cross-dissolve</span>
						<Switch
							checked={enabled}
							onCheckedChange={(checked) =>
								commitTransition({
									transition: checked
										? buildTransition({ durationSeconds })
										: undefined,
								})
							}
						/>
					</div>
					{enabled && (
						<SectionField label="Duration">
							<NumberField
								icon={<HugeiconsIcon icon={TransitionTopIcon} />}
								value={durationDraft.displayValue}
								suffix="s"
								scrubRanges={[
									{
										from: MIN_TRANSITION_SECONDS,
										to: MAX_TRANSITION_SECONDS,
										pixelsPerUnit: 64,
									},
								]}
								scrubClamp={{
									min: MIN_TRANSITION_SECONDS,
									max: MAX_TRANSITION_SECONDS,
								}}
								onFocus={() => {
									pendingDurationRef.current = durationSeconds;
									durationDraft.onFocus();
								}}
								onChange={durationDraft.onChange}
								onBlur={durationDraft.onBlur}
								onScrub={durationDraft.scrubTo}
								onScrubEnd={durationDraft.commitScrub}
								onReset={() =>
									commitTransition({
										transition: buildTransition({
											durationSeconds: DEFAULT_TRANSITION_SECONDS,
										}),
									})
								}
								isDefault={durationSeconds === DEFAULT_TRANSITION_SECONDS}
							/>
						</SectionField>
					)}
				</SectionFields>
			</SectionContent>
		</Section>
	);
}
