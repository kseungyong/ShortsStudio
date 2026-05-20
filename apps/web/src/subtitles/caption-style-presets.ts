import type { SubtitleStyleOverrides } from "./types";

export const CAPTION_STYLE_PRESET_IDS = [
	"default",
	"tiktok-box",
	"mrbeast-yellow",
	"karaoke-highlight",
	"minimal-white",
	"handwritten",
] as const;

/**
 * Discriminator for caption style presets. "default" applies no overrides
 * (uses OpenCut's built-in caption styling); the others apply common
 * trendy looks for short-form video.
 */
export type TCaptionStylePresetId =
	(typeof CAPTION_STYLE_PRESET_IDS)[number];

export interface TCaptionStylePreset {
	id: TCaptionStylePresetId;
	label: string;
	description: string;
	style: SubtitleStyleOverrides;
}

export const CAPTION_STYLE_PRESETS: readonly TCaptionStylePreset[] = [
	{
		id: "default",
		label: "Default",
		description: "ShortsStudio's default caption style (no overrides)",
		style: {},
	},
	{
		id: "tiktok-box",
		label: "TikTok Box",
		description: "White text on solid black rounded box, centered bottom",
		style: {
			color: "#ffffff",
			fontWeight: "bold",
			textAlign: "center",
			background: {
				enabled: true,
				color: "#000000",
				paddingX: 12,
				paddingY: 6,
				cornerRadius: 8,
			},
		},
	},
	{
		id: "mrbeast-yellow",
		label: "MrBeast Yellow",
		description: "Yellow bold text, large size, centered",
		style: {
			color: "#ffeb3b",
			fontWeight: "bold",
			fontSize: 8,
			textAlign: "center",
			background: {
				enabled: false,
				color: "#000000",
				paddingX: 0,
				paddingY: 0,
			},
		},
	},
	{
		id: "karaoke-highlight",
		label: "Karaoke Highlight",
		description: "White bold text on bright blue background, suitable for lyrics",
		style: {
			color: "#ffffff",
			fontWeight: "bold",
			textAlign: "center",
			background: {
				enabled: true,
				color: "#1976d2",
				paddingX: 10,
				paddingY: 4,
				cornerRadius: 4,
			},
		},
	},
	{
		id: "minimal-white",
		label: "Minimal White",
		description: "Clean white text, no background, normal weight",
		style: {
			color: "#ffffff",
			fontWeight: "normal",
			textAlign: "center",
			background: {
				enabled: false,
				color: "#000000",
				paddingX: 0,
				paddingY: 0,
			},
		},
	},
	{
		id: "handwritten",
		label: "Handwritten",
		description: "Italic cursive style on translucent dark background",
		style: {
			color: "#ffffff",
			fontFamily: "Caveat",
			fontStyle: "italic",
			textAlign: "center",
			background: {
				enabled: true,
				color: "#00000080",
				paddingX: 8,
				paddingY: 4,
				cornerRadius: 12,
			},
		},
	},
];

export function getCaptionStylePresetById({
	id,
}: {
	id: TCaptionStylePresetId;
}): TCaptionStylePreset | undefined {
	return CAPTION_STYLE_PRESETS.find((p) => p.id === id);
}
