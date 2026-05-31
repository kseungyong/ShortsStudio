import type { EffectDefinition } from "@/effects/types";
import { clamp, readNumber } from "./_utils";

export const SHARPEN_SHADER = "sharpen";

export const sharpenEffectDefinition: EffectDefinition = {
	type: "sharpen",
	name: "Sharpen",
	keywords: ["sharpen", "crisp", "detail"],
	params: [
		{
			key: "amount",
			label: "Amount",
			type: "number",
			default: 0.5,
			min: 0,
			max: 2,
			step: 0.05,
		},
	],
	renderer: {
		passes: [
			{
				shader: SHARPEN_SHADER,
				uniforms: ({ effectParams }) => ({
					u_amount: clamp({
						value: readNumber({
							params: effectParams,
							key: "amount",
							fallback: 0.5,
						}),
						min: 0,
						max: 2,
					}),
				}),
			},
		],
	},
};
