import { describe, expect, test } from "bun:test";
import {
	vignetteEffectDefinition,
	VIGNETTE_SHADER,
} from "@/effects/definitions/vignette";

describe("vignetteEffectDefinition", () => {
	test("type and shader id match", () => {
		expect(vignetteEffectDefinition.type).toBe("vignette");
		expect(VIGNETTE_SHADER).toBe("vignette");
	});

	test("has 4 params (intensity, falloff, centerX, centerY)", () => {
		const keys = vignetteEffectDefinition.params.map((p) => p.key);
		expect(keys).toEqual(["intensity", "falloff", "centerX", "centerY"]);
	});

	test("intensity default in [0,1]", () => {
		const intensity = vignetteEffectDefinition.params.find(
			(p) => p.key === "intensity",
		);
		expect(intensity?.default).toBeGreaterThanOrEqual(0);
		expect(intensity?.default).toBeLessThanOrEqual(1);
	});

	test("renderer has a single pass with vignette shader", () => {
		expect(vignetteEffectDefinition.renderer.passes.length).toBe(1);
		expect(vignetteEffectDefinition.renderer.passes[0]?.shader).toBe(
			"vignette",
		);
	});

	test("uniforms function returns clamped values", () => {
		const uniforms = vignetteEffectDefinition.renderer.passes[0]?.uniforms({
			effectParams: {
				intensity: 2,
				falloff: -0.5,
				centerX: 0.5,
				centerY: 0.5,
			},
			width: 1080,
			height: 1920,
		});
		expect(uniforms?.u_intensity).toBe(1); // clamped from 2
		expect(uniforms?.u_falloff).toBe(0); // clamped from -0.5
	});

	test("centerX and centerY clamp to [0,1]", () => {
		const uniforms = vignetteEffectDefinition.renderer.passes[0]?.uniforms({
			effectParams: {
				intensity: 0.5,
				falloff: 0.4,
				centerX: 1.5, // > 1
				centerY: -0.3, // < 0
			},
			width: 1080,
			height: 1920,
		});
		expect(uniforms?.u_center_x).toBe(1);
		expect(uniforms?.u_center_y).toBe(0);
	});

	test("missing params fall back to defaults (not NaN)", () => {
		const uniforms = vignetteEffectDefinition.renderer.passes[0]?.uniforms({
			effectParams: {},
			width: 1080,
			height: 1920,
		});
		// Defaults from definition: intensity=0.5, falloff=0.4, centerX=0.5, centerY=0.5
		expect(uniforms?.u_intensity).toBe(0.5);
		expect(uniforms?.u_falloff).toBe(0.4);
		expect(uniforms?.u_center_x).toBe(0.5);
		expect(uniforms?.u_center_y).toBe(0.5);
		for (const value of Object.values(uniforms ?? {})) {
			expect(Number.isFinite(value as number)).toBe(true);
		}
	});

	test("string params are parsed as numbers", () => {
		const uniforms = vignetteEffectDefinition.renderer.passes[0]?.uniforms({
			effectParams: {
				intensity: "0.7",
				falloff: "0.3",
				centerX: "0.4",
				centerY: "0.6",
			},
			width: 1080,
			height: 1920,
		});
		expect(uniforms?.u_intensity).toBeCloseTo(0.7, 5);
		expect(uniforms?.u_falloff).toBeCloseTo(0.3, 5);
		expect(uniforms?.u_center_x).toBeCloseTo(0.4, 5);
		expect(uniforms?.u_center_y).toBeCloseTo(0.6, 5);
	});
});
