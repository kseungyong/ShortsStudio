import { describe, expect, test } from "bun:test";
import {
	TEXT_OVERLAY_PRESETS,
	TEXT_OVERLAY_PRESET_IDS,
	type TTextOverlayPresetId,
	getTextOverlayPresetById,
} from "@/text/text-overlay-presets";

describe("TEXT_OVERLAY_PRESETS", () => {
	test("contains 10 presets in declared order", () => {
		const ids = TEXT_OVERLAY_PRESETS.map((p) => p.id);
		expect(ids).toEqual([
			"plain",
			"title-bold",
			"subtitle-soft",
			"banner-red",
			"banner-yellow",
			"tag-pill",
			"badge-outlined",
			"caption-pop",
			"quote-italic",
			"shoutout-mono",
		]);
	});

	test("every preset id is in TEXT_OVERLAY_PRESET_IDS", () => {
		for (const preset of TEXT_OVERLAY_PRESETS) {
			expect(TEXT_OVERLAY_PRESET_IDS).toContain(preset.id);
		}
	});

	test("every preset has non-empty label and description", () => {
		for (const preset of TEXT_OVERLAY_PRESETS) {
			expect(preset.label).toMatch(/\S/);
			expect(preset.description).toMatch(/\S/);
		}
	});

	test("every preset has required style fields with valid values", () => {
		for (const preset of TEXT_OVERLAY_PRESETS) {
			expect(preset.style.fontWeight).toMatch(/^(normal|bold)$/);
			expect(preset.style.fontStyle).toMatch(/^(normal|italic)$/);
			expect(preset.style.textAlign).toMatch(/^(left|center|right)$/);
			expect(preset.style.color).toMatch(/^#[0-9a-fA-F]{6,8}$/);
		}
	});

	test("banner-yellow has black text on yellow", () => {
		const preset = getTextOverlayPresetById({ id: "banner-yellow" });
		expect(preset?.style.color).toBe("#000000");
		expect(preset?.style.background?.color).toBe("#ffeb3b");
	});

	test("tag-pill has large cornerRadius for pill shape", () => {
		const preset = getTextOverlayPresetById({ id: "tag-pill" });
		const cornerRadius = preset?.style.background?.cornerRadius;
		expect(cornerRadius).toBeDefined();
		// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
		expect(cornerRadius as number).toBeGreaterThanOrEqual(50);
	});

	test("getTextOverlayPresetById returns undefined for unknown id", () => {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
		const preset = getTextOverlayPresetById({ id: "nope" as unknown as TTextOverlayPresetId });
		expect(preset).toBeUndefined();
	});
});
