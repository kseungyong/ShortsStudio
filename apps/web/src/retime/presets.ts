import type { RetimeConfig } from "@/timeline";
import { clampRetimeRate } from "@/retime/rate";

export function buildConstantRetime({
	rate,
	maintainPitch = false,
}: {
	rate: number;
	maintainPitch?: boolean;
}): RetimeConfig {
	return { rate: clampRetimeRate({ rate }), maintainPitch };
}

// ─── 1-tap speed presets ────────────────────────────────────────────────────

export const SPEED_PRESET_IDS = [
	"slow-0.5x",
	"normal-1x",
	"fast-1.5x",
	"fast-2x",
	"fast-3x",
] as const;

/**
 * Discriminator for 1-tap speed presets. Used by the editor's speed
 * control UX to apply a rate change without the user typing a number.
 */
export type TSpeedPresetId = (typeof SPEED_PRESET_IDS)[number];

export interface TSpeedPreset {
	id: TSpeedPresetId;
	label: string;
	rate: number;
	maintainPitch: boolean;
}

/**
 * 1-tap speed presets. Non-1× presets default to maintainPitch=true so
 * voice doesn't chipmunk when sped up. For music/SFX where pitch shift
 * is desired, callers can still use buildConstantRetime with
 * maintainPitch=false directly.
 */
export const SPEED_PRESETS: readonly TSpeedPreset[] = [
	{ id: "slow-0.5x", label: "0.5×", rate: 0.5, maintainPitch: true },
	{ id: "normal-1x", label: "1×", rate: 1, maintainPitch: false },
	{ id: "fast-1.5x", label: "1.5×", rate: 1.5, maintainPitch: true },
	{ id: "fast-2x", label: "2×", rate: 2, maintainPitch: true },
	{ id: "fast-3x", label: "3×", rate: 3, maintainPitch: true },
];

export function getSpeedPresetById({
	id,
}: {
	id: TSpeedPresetId;
}): TSpeedPreset | undefined {
	return SPEED_PRESETS.find((p) => p.id === id);
}

export function buildRetimeFromSpeedPreset({
	id,
}: {
	id: TSpeedPresetId;
}): RetimeConfig | undefined {
	const preset = getSpeedPresetById({ id });
	if (!preset) return undefined;
	return buildConstantRetime({
		rate: preset.rate,
		maintainPitch: preset.maintainPitch,
	});
}
