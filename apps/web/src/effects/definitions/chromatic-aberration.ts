import type { EffectDefinition } from "@/effects/types";
import { clamp, readNumber } from "./_utils";

export const CHROMATIC_ABERRATION_SHADER = "chromatic-aberration";

const MAX_AMOUNT = 0.05; // UV-space offset cap; beyond this looks broken

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
					// Angle is intentionally not clamped. The UI declares max 360 as a
					// hint for the slider, but values outside [0, 360] wrap naturally
					// through cos/sin in the shader (370° = 10°, -45° = 315°). Clamping
					// would lie about the geometry.
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
