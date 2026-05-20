import type { TextBackground } from "./background";
import type {
	TextAlign,
	TextDecoration,
	TextFontStyle,
	TextFontWeight,
} from "./primitives";

export const TEXT_OVERLAY_PRESET_IDS = [
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
] as const;

/**
 * Discriminator for text overlay style presets. Each preset packages
 * a common look (font weight, color, alignment, optional background)
 * so users can apply it to a text element without configuring each
 * field individually.
 */
export type TTextOverlayPresetId = (typeof TEXT_OVERLAY_PRESET_IDS)[number];

/**
 * The subset of text styling fields a preset can override. Font sizing
 * is intentionally optional so presets can either fix a size or inherit
 * the user's current size.
 */
export interface TextOverlayStyle {
	fontFamily?: string;
	fontSize?: number;
	fontWeight: TextFontWeight;
	fontStyle: TextFontStyle;
	textAlign: TextAlign;
	textDecoration?: TextDecoration;
	color: string;
	letterSpacing?: number;
	lineHeight?: number;
	background?: Partial<Pick<
		TextBackground,
		"enabled" | "color" | "paddingX" | "paddingY" | "cornerRadius"
	>>;
}

export interface TTextOverlayPreset {
	id: TTextOverlayPresetId;
	label: string;
	description: string;
	style: TextOverlayStyle;
}

export const TEXT_OVERLAY_PRESETS: readonly TTextOverlayPreset[] = [
	{
		id: "plain",
		label: "Plain",
		description: "Basic white text, no background",
		style: {
			fontWeight: "normal",
			fontStyle: "normal",
			textAlign: "center",
			color: "#ffffff",
		},
	},
	{
		id: "title-bold",
		label: "Title (Bold)",
		description: "Large bold white text for titles",
		style: {
			fontSize: 12,
			fontWeight: "bold",
			fontStyle: "normal",
			textAlign: "center",
			color: "#ffffff",
		},
	},
	{
		id: "subtitle-soft",
		label: "Subtitle (Soft)",
		description: "Smaller subdued white text for secondary lines",
		style: {
			fontSize: 6,
			fontWeight: "normal",
			fontStyle: "normal",
			textAlign: "center",
			color: "#e0e0e0",
			letterSpacing: 1,
		},
	},
	{
		id: "banner-red",
		label: "Banner (Red)",
		description: "White bold text on red rounded banner",
		style: {
			fontWeight: "bold",
			fontStyle: "normal",
			textAlign: "center",
			color: "#ffffff",
			background: {
				enabled: true,
				color: "#d32f2f",
				paddingX: 16,
				paddingY: 8,
				cornerRadius: 6,
			},
		},
	},
	{
		id: "banner-yellow",
		label: "Banner (Yellow)",
		description: "Black bold text on yellow rounded banner",
		style: {
			fontWeight: "bold",
			fontStyle: "normal",
			textAlign: "center",
			color: "#000000",
			background: {
				enabled: true,
				color: "#ffeb3b",
				paddingX: 16,
				paddingY: 8,
				cornerRadius: 6,
			},
		},
	},
	{
		id: "tag-pill",
		label: "Tag (Pill)",
		description: "Small dark text in light pill background",
		style: {
			fontSize: 4,
			fontWeight: "normal",
			fontStyle: "normal",
			textAlign: "center",
			color: "#212121",
			background: {
				enabled: true,
				color: "#f5f5f5",
				paddingX: 12,
				paddingY: 4,
				cornerRadius: 100,
			},
		},
	},
	{
		id: "badge-outlined",
		label: "Badge (Outlined)",
		description: "White text on translucent dark background",
		style: {
			fontWeight: "bold",
			fontStyle: "normal",
			textAlign: "center",
			color: "#ffffff",
			background: {
				enabled: true,
				color: "#000000cc",
				paddingX: 10,
				paddingY: 6,
				cornerRadius: 4,
			},
		},
	},
	{
		id: "caption-pop",
		label: "Caption (Pop)",
		description: "Vivid orange text, eye-catching",
		style: {
			fontWeight: "bold",
			fontStyle: "normal",
			textAlign: "center",
			color: "#ff5722",
		},
	},
	{
		id: "quote-italic",
		label: "Quote (Italic)",
		description: "Italic style for quotes",
		style: {
			fontWeight: "normal",
			fontStyle: "italic",
			textAlign: "center",
			color: "#ffffff",
		},
	},
	{
		id: "shoutout-mono",
		label: "Shoutout (Mono)",
		description: "Monospace style for usernames or code",
		style: {
			fontFamily: "JetBrains Mono",
			fontWeight: "normal",
			fontStyle: "normal",
			textAlign: "center",
			color: "#80cbc4",
		},
	},
];

export function getTextOverlayPresetById({
	id,
}: {
	id: TTextOverlayPresetId;
}): TTextOverlayPreset | undefined {
	return TEXT_OVERLAY_PRESETS.find((p) => p.id === id);
}
