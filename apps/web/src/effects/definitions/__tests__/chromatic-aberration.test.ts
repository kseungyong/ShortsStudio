import { describe, expect, test } from "bun:test";
import {
	chromaticAberrationEffectDefinition,
	CHROMATIC_ABERRATION_SHADER,
} from "@/effects/definitions/chromatic-aberration";

describe("chromaticAberrationEffectDefinition", () => {
	test("type and shader id match", () => {
		expect(chromaticAberrationEffectDefinition.type).toBe(
			"chromatic-aberration",
		);
		expect(CHROMATIC_ABERRATION_SHADER).toBe("chromatic-aberration");
	});

	test("has 2 params (amount, angle)", () => {
		const keys = chromaticAberrationEffectDefinition.params.map((p) => p.key);
		expect(keys).toEqual(["amount", "angle"]);
	});

	test("amount default within [0, 0.05]", () => {
		const amount = chromaticAberrationEffectDefinition.params[0];
		expect(amount?.default).toBe(0.005);
		if (amount?.type === "number") {
			expect(amount.min).toBe(0);
			expect(amount.max).toBe(0.05);
		}
	});

	test("angle default 0 within [0, 360]", () => {
		const angle = chromaticAberrationEffectDefinition.params[1];
		expect(angle?.default).toBe(0);
		if (angle?.type === "number") {
			expect(angle.min).toBe(0);
			expect(angle.max).toBe(360);
		}
	});

	test("renderer has single pass with chromatic-aberration shader", () => {
		expect(chromaticAberrationEffectDefinition.renderer.passes.length).toBe(1);
		expect(
			chromaticAberrationEffectDefinition.renderer.passes[0]?.shader,
		).toBe("chromatic-aberration");
	});

	test("amount clamps to [0, 0.05]", () => {
		const overUniforms =
			chromaticAberrationEffectDefinition.renderer.passes[0]?.uniforms({
				effectParams: { amount: 1, angle: 0 },
				width: 1080,
				height: 1920,
			});
		const underUniforms =
			chromaticAberrationEffectDefinition.renderer.passes[0]?.uniforms({
				effectParams: { amount: -1, angle: 0 },
				width: 1080,
				height: 1920,
			});
		expect(overUniforms?.u_amount).toBe(0.05);
		expect(underUniforms?.u_amount).toBe(0);
	});

	test("angle is converted from degrees to radians", () => {
		const uniforms = chromaticAberrationEffectDefinition.renderer.passes[0]?.uniforms({
			effectParams: { amount: 0.01, angle: 90 },
			width: 1080,
			height: 1920,
		});
		expect(uniforms?.u_angle).toBeCloseTo(Math.PI / 2, 5);
	});

	test("missing params fall back to defaults", () => {
		const uniforms = chromaticAberrationEffectDefinition.renderer.passes[0]?.uniforms({
			effectParams: {},
			width: 1080,
			height: 1920,
		});
		expect(uniforms?.u_amount).toBe(0.005);
		expect(uniforms?.u_angle).toBe(0);
	});
});
