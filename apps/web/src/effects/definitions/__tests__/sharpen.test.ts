import { describe, expect, test } from "bun:test";
import {
	sharpenEffectDefinition,
	SHARPEN_SHADER,
} from "@/effects/definitions/sharpen";

describe("sharpenEffectDefinition", () => {
	test("type and shader id match", () => {
		expect(sharpenEffectDefinition.type).toBe("sharpen");
		expect(SHARPEN_SHADER).toBe("sharpen");
	});

	test("has single 'amount' param with [0,2] range", () => {
		const keys = sharpenEffectDefinition.params.map((p) => p.key);
		expect(keys).toEqual(["amount"]);
		const amount = sharpenEffectDefinition.params[0];
		expect(amount?.type).toBe("number");
		if (amount?.type === "number") {
			expect(amount.min).toBe(0);
			expect(amount.max).toBe(2);
			expect(amount.default).toBe(0.5);
		}
	});

	test("renderer has single pass with sharpen shader", () => {
		expect(sharpenEffectDefinition.renderer.passes.length).toBe(1);
		expect(sharpenEffectDefinition.renderer.passes[0]?.shader).toBe("sharpen");
	});

	test("uniforms clamp amount to [0,2]", () => {
		const overUniforms = sharpenEffectDefinition.renderer.passes[0]?.uniforms({
			effectParams: { amount: 5 },
			width: 1080,
			height: 1920,
		});
		const underUniforms = sharpenEffectDefinition.renderer.passes[0]?.uniforms({
			effectParams: { amount: -1 },
			width: 1080,
			height: 1920,
		});
		expect(overUniforms?.u_amount).toBe(2);
		expect(underUniforms?.u_amount).toBe(0);
	});

	test("missing amount falls back to default 0.5", () => {
		const uniforms = sharpenEffectDefinition.renderer.passes[0]?.uniforms({
			effectParams: {},
			width: 1080,
			height: 1920,
		});
		expect(uniforms?.u_amount).toBe(0.5);
	});

	test("string amount is parsed", () => {
		const uniforms = sharpenEffectDefinition.renderer.passes[0]?.uniforms({
			effectParams: { amount: "1.2" },
			width: 1080,
			height: 1920,
		});
		expect(uniforms?.u_amount).toBeCloseTo(1.2, 5);
	});
});
