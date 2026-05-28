import type { EffectDefinition } from "@/effects/types";

export const CHROMATIC_ABERRATION_SHADER = "chromatic-aberration";

const MAX_AMOUNT = 0.05; // UV-space offset cap; beyond this looks broken

function clamp({
	value,
	min,
	max,
}: {
	value: number;
	min: number;
	max: number;
}): number {
	return Math.min(max, Math.max(min, value));
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

export const chromaticAberrationEffectDefinition: EffectDefinition = {
	type: "chromatic-aberration",
	name: "Chromatic aberration",
	keywords: ["chromatic", "aberration", "rgb shift", "glitch"],
	params: [
		{
			key: "amount",
			label: "Amount",
			type: "number",
			default: 0.005,
			min: 0,
			max: MAX_AMOUNT,
			step: 0.001,
		},
		{
			key: "angle",
			label: "Angle (deg)",
			type: "number",
			default: 0,
			min: 0,
			max: 360,
			step: 1,
		},
	],
	renderer: {
		passes: [
			{
				shader: CHROMATIC_ABERRATION_SHADER,
				uniforms: ({ effectParams }) => {
					const amount = clamp({
						value: readNumber({
							params: effectParams,
							key: "amount",
							fallback: 0.005,
						}),
						min: 0,
						max: MAX_AMOUNT,
					});
					const angleDeg = readNumber({
						params: effectParams,
						key: "angle",
						fallback: 0,
					});
					const angleRad = (angleDeg * Math.PI) / 180;
					return {
						u_amount: amount,
						u_angle: angleRad,
					};
				},
			},
		],
	},
};
