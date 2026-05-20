import { describe, expect, test } from "bun:test";
import {
	CAPTION_STYLE_PRESETS,
	CAPTION_STYLE_PRESET_IDS,
	getCaptionStylePresetById,
	type TCaptionStylePresetId,
} from "@/subtitles/caption-style-presets";

describe("CAPTION_STYLE_PRESETS", () => {
	test("has 6 presets in declared order (default + 5 styled)", () => {
		const ids = CAPTION_STYLE_PRESETS.map((p) => p.id);
		expect(ids).toEqual([
			"default",
			"tiktok-box",
			"mrbeast-yellow",
			"karaoke-highlight",
			"minimal-white",
			"handwritten",
		]);
	});

	test("every preset id is in CAPTION_STYLE_PRESET_IDS", () => {
		for (const preset of CAPTION_STYLE_PRESETS) {
			expect(CAPTION_STYLE_PRESET_IDS).toContain(preset.id);
		}
	});

	test("every preset has non-empty label and description", () => {
		for (const preset of CAPTION_STYLE_PRESETS) {
			expect(preset.label).toMatch(/\S/);
			expect(preset.description).toMatch(/\S/);
		}
	});

	test("default preset has no style overrides", () => {
		const def = getCaptionStylePresetById({ id: "default" });
		expect(def?.style).toEqual({});
	});

	test("tiktok-box has solid black background and white bold text", () => {
		const preset = getCaptionStylePresetById({ id: "tiktok-box" });
		expect(preset?.style.color).toBe("#ffffff");
		expect(preset?.style.fontWeight).toBe("bold");
		expect(preset?.style.background?.enabled).toBe(true);
		expect(preset?.style.background?.color).toBe("#000000");
	});

	test("getCaptionStylePresetById returns undefined for unknown id", () => {
		const preset = getCaptionStylePresetById({
			// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
			id: "nonexistent" as unknown as TCaptionStylePresetId,
		});
		expect(preset).toBeUndefined();
	});
});
