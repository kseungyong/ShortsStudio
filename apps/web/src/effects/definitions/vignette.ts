import type { EffectDefinition } from "@/effects/types";
import { clamp, readNumber } from "./_utils";

export const VIGNETTE_SHADER = "vignette";

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
					u_intensity: clamp({
						value: readNumber({ params: effectParams, key: "intensity", fallback: 0.5 }),
						min: 0,
						max: 1,
					}),
					u_falloff: clamp({
						value: readNumber({ params: effectParams, key: "falloff", fallback: 0.4 }),
						min: 0,
						max: 1,
					}),
					u_center_x: clamp({
						value: readNumber({ params: effectParams, key: "centerX", fallback: 0.5 }),
						min: 0,
						max: 1,
					}),
					u_center_y: clamp({
						value: readNumber({ params: effectParams, key: "centerY", fallback: 0.5 }),
						min: 0,
						max: 1,
					}),
				}),
			},
		],
	},
};
