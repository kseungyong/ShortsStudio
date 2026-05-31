import { describe, expect, test } from "bun:test";
import {
	colorGradeEffectDefinition,
	COLOR_GRADE_SHADER,
} from "@/effects/definitions/color-grade";

describe("colorGradeEffectDefinition", () => {
	test("type and shader id match", () => {
		expect(colorGradeEffectDefinition.type).toBe("color-grade");
		expect(COLOR_GRADE_SHADER).toBe("color-grade");
	});

	test("has 3 params (exposure, contrast, saturation)", () => {
		const keys = colorGradeEffectDefinition.params.map((p) => p.key);
		expect(keys).toEqual(["exposure", "contrast", "saturation"]);
	});

	test("exposure default 0 within range [-2,2]", () => {
		const exposure = colorGradeEffectDefinition.params.find(
			(p) => p.key === "exposure",
		);
		expect(exposure?.default).toBe(0);
		if (exposure?.type === "number") {
			expect(exposure.min).toBe(-2);
			expect(exposure.max).toBe(2);
		}
	});

	test("contrast and saturation defaults are 1 (neutral)", () => {
		const contrast = colorGradeEffectDefinition.params.find(
			(p) => p.key === "contrast",
		);
		const saturation = colorGradeEffectDefinition.params.find(
			(p) => p.key === "saturation",
		);
		expect(contrast?.default).toBe(1);
		expect(saturation?.default).toBe(1);
	});

	test("renderer has single pass with color-grade shader", () => {
		expect(colorGradeEffectDefinition.renderer.passes.length).toBe(1);
		expect(colorGradeEffectDefinition.renderer.passes[0]?.shader).toBe(
			"color-grade",
		);
	});

	test("exposure clamps to [-2, 2]", () => {
		const overUniforms = colorGradeEffectDefinition.renderer.passes[0]?.uniforms(
			{
				effectParams: { exposure: 5, contrast: 1, saturation: 1 },
				width: 1080,
				height: 1920,
			},
		);
		const underUniforms = colorGradeEffectDefinition.renderer.passes[0]?.uniforms(
			{
				effectParams: { exposure: -5, contrast: 1, saturation: 1 },
				width: 1080,
				height: 1920,
			},
		);
		expect(overUniforms?.u_exposure).toBe(2);
		expect(underUniforms?.u_exposure).toBe(-2);
	});

	test("contrast and saturation clamp to [0, 2]", () => {
		const overUniforms = colorGradeEffectDefinition.renderer.passes[0]?.uniforms(
			{
				effectParams: { exposure: 0, contrast: 5, saturation: 5 },
				width: 1080,
				height: 1920,
			},
		);
		const underUniforms = colorGradeEffectDefinition.renderer.passes[0]?.uniforms(
			{
				effectParams: { exposure: 0, contrast: -1, saturation: -1 },
				width: 1080,
				height: 1920,
			},
		);
		expect(overUniforms?.u_contrast).toBe(2);
		expect(overUniforms?.u_saturation).toBe(2);
		expect(underUniforms?.u_contrast).toBe(0);
		expect(underUniforms?.u_saturation).toBe(0);
	});

	test("missing params fall back to neutral defaults", () => {
		const uniforms = colorGradeEffectDefinition.renderer.passes[0]?.uniforms({
			effectParams: {},
			width: 1080,
			height: 1920,
		});
		expect(uniforms?.u_exposure).toBe(0);
		expect(uniforms?.u_contrast).toBe(1);
		expect(uniforms?.u_saturation).toBe(1);
	});

	test("contrast=0 is a valid degenerate state (entire image collapses to 0.5)", () => {
		// Boundary case: the shader does (rgb - 0.5) * 0 + 0.5 = 0.5 for every
		// pixel, producing a flat-gray frame. Uniforms must pass 0 through, not
		// clamp it away from the boundary.
		const uniforms = colorGradeEffectDefinition.renderer.passes[0]?.uniforms({
			effectParams: { exposure: 0, contrast: 0, saturation: 1 },
			width: 1080,
			height: 1920,
		});
		expect(uniforms?.u_contrast).toBe(0);
	});

	test("extreme combined params still produce in-range uniforms", () => {
		// Cross-product smoke test: maxing every axis together must not silently
		// drop or NaN any uniform. The shader's final clamp catches downstream
		// overflow; this test guards the TS uniform-packing layer.
		const uniforms = colorGradeEffectDefinition.renderer.passes[0]?.uniforms({
			effectParams: { exposure: 2, contrast: 2, saturation: 2 },
			width: 1080,
			height: 1920,
		});
		expect(uniforms?.u_exposure).toBe(2);
		expect(uniforms?.u_contrast).toBe(2);
		expect(uniforms?.u_saturation).toBe(2);
	});

	test("NaN inputs fall back to neutral defaults", () => {
		const uniforms = colorGradeEffectDefinition.renderer.passes[0]?.uniforms({
			effectParams: {
				exposure: Number.NaN,
				contrast: Number.NaN,
				saturation: Number.NaN,
			},
			width: 1080,
			height: 1920,
		});
		expect(uniforms?.u_exposure).toBe(0);
		expect(uniforms?.u_contrast).toBe(1);
		expect(uniforms?.u_saturation).toBe(1);
	});
});
