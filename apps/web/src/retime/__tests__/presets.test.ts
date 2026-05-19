import { describe, expect, test } from "bun:test";
import {
	SPEED_PRESETS,
	SPEED_PRESET_IDS,
	type TSpeedPresetId,
	buildConstantRetime,
	buildRetimeFromSpeedPreset,
	getSpeedPresetById,
} from "@/retime/presets";

describe("SPEED_PRESETS catalog", () => {
	test("contains 5 presets in declared order", () => {
		const ids = SPEED_PRESETS.map((p) => p.id);
		expect(ids).toEqual([
			"slow-0.5x",
			"normal-1x",
			"fast-1.5x",
			"fast-2x",
			"fast-3x",
		]);
	});

	test("every id is in SPEED_PRESET_IDS", () => {
		for (const preset of SPEED_PRESETS) {
			expect(SPEED_PRESET_IDS).toContain(preset.id);
		}
	});

	test("every label has the × suffix", () => {
		for (const preset of SPEED_PRESETS) {
			expect(preset.label).toMatch(/×$/);
		}
	});

	test("rates are strictly monotonically increasing", () => {
		for (let i = 1; i < SPEED_PRESETS.length; i++) {
			const current = SPEED_PRESETS[i];
			const previous = SPEED_PRESETS[i - 1];
			if (!current || !previous) continue;
			expect(current.rate).toBeGreaterThan(previous.rate);
		}
	});

	test("normal-1x has rate 1 and maintainPitch false", () => {
		const preset = getSpeedPresetById({ id: "normal-1x" });
		expect(preset?.rate).toBe(1);
		expect(preset?.maintainPitch).toBe(false);
	});

	test("all non-1x presets maintain pitch", () => {
		for (const preset of SPEED_PRESETS) {
			if (preset.id === "normal-1x") continue;
			expect(preset.maintainPitch).toBe(true);
		}
	});
});

describe("buildRetimeFromSpeedPreset", () => {
	test("returns RetimeConfig with preset rate", () => {
		const config = buildRetimeFromSpeedPreset({ id: "fast-2x" });
		expect(config?.rate).toBe(2);
		expect(config?.maintainPitch).toBe(true);
	});

	test("returns undefined for unknown id", () => {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
		const config = buildRetimeFromSpeedPreset({ id: "nope" as unknown as TSpeedPresetId });
		expect(config).toBeUndefined();
	});

	test("matches buildConstantRetime for same rate", () => {
		const direct = buildConstantRetime({ rate: 2, maintainPitch: true });
		const fromPreset = buildRetimeFromSpeedPreset({ id: "fast-2x" });
		expect(fromPreset).toEqual(direct);
	});
});
