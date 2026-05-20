import { describe, expect, test } from "bun:test";
import {
	buildGaussianBlurPasses,
	intensityToSigma,
} from "@/effects/definitions/blur";

describe("buildGaussianBlurPasses", () => {
	test("zero sigma yields no passes", () => {
		const passes = buildGaussianBlurPasses({ sigmaX: 0, sigmaY: 0 });
		expect(passes).toEqual([]);
	});

	test("small sigma yields one iteration (H + V = 2 passes)", () => {
		const passes = buildGaussianBlurPasses({ sigmaX: 2, sigmaY: 2 });
		expect(passes.length).toBe(2);
		expect(passes[0]?.uniforms.u_direction).toEqual([1, 0]);
		expect(passes[1]?.uniforms.u_direction).toEqual([0, 1]);
	});

	test("very large sigma is bounded by MAX_ITERATIONS (= 4 after fix)", () => {
		const passes = buildGaussianBlurPasses({ sigmaX: 1000, sigmaY: 1000 });
		// iterations ≤ 4, each iteration = 2 passes (H + V) → max 8 passes
		expect(passes.length).toBeLessThanOrEqual(8);
	});

	test("each pass has finite numeric uniforms", () => {
		const passes = buildGaussianBlurPasses({ sigmaX: 30, sigmaY: 30 });
		for (const pass of passes) {
			expect(Number.isFinite(pass.uniforms.u_sigma)).toBe(true);
			expect(Number.isFinite(pass.uniforms.u_step)).toBe(true);
		}
	});

	test("each pass alternates H then V direction", () => {
		const passes = buildGaussianBlurPasses({ sigmaX: 30, sigmaY: 30 });
		for (let i = 0; i < passes.length; i++) {
			const expectedDir = i % 2 === 0 ? [1, 0] : [0, 1];
			expect(passes[i]?.uniforms.u_direction).toEqual(expectedDir);
		}
	});
});

describe("intensityToSigma", () => {
	test("scales linearly with intensity", () => {
		const a = intensityToSigma({ intensity: 10, resolution: 1080, reference: 1080 });
		const b = intensityToSigma({ intensity: 20, resolution: 1080, reference: 1080 });
		expect(b).toBeCloseTo(a * 2, 5);
	});

	test("scales with resolution ratio", () => {
		const at1080 = intensityToSigma({ intensity: 20, resolution: 1080, reference: 1080 });
		const at4k = intensityToSigma({ intensity: 20, resolution: 2160, reference: 1080 });
		expect(at4k).toBeCloseTo(at1080 * 2, 5);
	});

	test("zero intensity yields zero sigma", () => {
		const sigma = intensityToSigma({ intensity: 0, resolution: 1080, reference: 1080 });
		expect(sigma).toBe(0);
	});
});
