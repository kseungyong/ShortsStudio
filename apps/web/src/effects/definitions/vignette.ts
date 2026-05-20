import type { EffectDefinition } from "@/effects/types";

export const VIGNETTE_SHADER = "vignette";

function clamp01(value: number): number {
	return Math.min(1, Math.max(0, value));
}

function readNumber({
	params,
	key,
	fallback,
}: {
	params: Record<string, unknown>;
	key: string;
	fallback: number;
}): number {
	const raw = params[key];
	if (typeof raw === "number" && Number.isFinite(raw)) return raw;
	const parsed = Number.parseFloat(String(raw));
	return Number.isFinite(parsed) ? parsed : fallback;
}

export const vignetteEffectDefinition: EffectDefinition = {
	type: "vignette",
	name: "Vignette",
	keywords: ["vignette", "darken edges", "border"],
	params: [
		{
			key: "intensity",
			label: "Intensity",
			type: "number",
			default: 0.5,
			min: 0,
			max: 1,
			step: 0.01,
		},
		{
			key: "falloff",
			label: "Falloff",
			type: "number",
			default: 0.4,
			min: 0,
			max: 1,
			step: 0.01,
		},
		{
			key: "centerX",
			label: "Center X",
			type: "number",
			default: 0.5,
			min: 0,
			max: 1,
			step: 0.01,
		},
		{
			key: "centerY",
			label: "Center Y",
			type: "number",
			default: 0.5,
			min: 0,
			max: 1,
			step: 0.01,
		},
	],
	renderer: {
		passes: [
			{
				shader: VIGNETTE_SHADER,
				uniforms: ({ effectParams }) => ({
					u_intensity: clamp01(readNumber({ params: effectParams, key: "intensity", fallback: 0.5 })),
					u_falloff: clamp01(readNumber({ params: effectParams, key: "falloff", fallback: 0.4 })),
					u_center_x: clamp01(readNumber({ params: effectParams, key: "centerX", fallback: 0.5 })),
					u_center_y: clamp01(readNumber({ params: effectParams, key: "centerY", fallback: 0.5 })),
				}),
			},
		],
	},
};
