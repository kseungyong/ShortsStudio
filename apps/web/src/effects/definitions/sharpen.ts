import type { EffectDefinition } from "@/effects/types";

export const SHARPEN_SHADER = "sharpen";

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
