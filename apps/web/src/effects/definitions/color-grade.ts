import type { EffectDefinition } from "@/effects/types";
import { clamp, readNumber } from "./_utils";

export const COLOR_GRADE_SHADER = "color-grade";

export const colorGradeEffectDefinition: EffectDefinition = {
	type: "color-grade",
	name: "Color grade",
	keywords: ["color", "grade", "exposure", "contrast", "saturation"],
	params: [
		{
			key: "exposure",
			label: "Exposure",
			type: "number",
			default: 0,
			min: -2,
			max: 2,
			step: 0.05,
		},
		{
			key: "contrast",
			label: "Contrast",
			type: "number",
			default: 1,
			min: 0,
			max: 2,
			step: 0.05,
		},
		{
			key: "saturation",
			label: "Saturation",
			type: "number",
			default: 1,
			min: 0,
			max: 2,
			step: 0.05,
		},
	],
	renderer: {
		passes: [
			{
				shader: COLOR_GRADE_SHADER,
				uniforms: ({ effectParams }) => ({
					u_exposure: clamp({
						value: readNumber({
							params: effectParams,
							key: "exposure",
							fallback: 0,
						}),
						min: -2,
						max: 2,
					}),
					u_contrast: clamp({
						value: readNumber({
							params: effectParams,
							key: "contrast",
							fallback: 1,
						}),
						min: 0,
						max: 2,
					}),
					u_saturation: clamp({
						value: readNumber({
							params: effectParams,
							key: "saturation",
							fallback: 1,
						}),
						min: 0,
						max: 2,
					}),
				}),
			},
		],
	},
};
