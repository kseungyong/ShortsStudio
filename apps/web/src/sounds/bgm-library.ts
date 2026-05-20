/**
 * Curated BGM library — CC0 licensed tracks suitable for YouTube Shorts.
 * Tracks are categorized by mood. URLs are placeholders until self-hosted
 * or external CDN is decided; license metadata identifies the source so
 * URLs can be filled in without restructuring.
 */

export const BGM_MOODS = [
	"upbeat",
	"chill",
	"emotional",
	"cinematic",
	"electronic",
] as const;

export type TBgmMood = (typeof BGM_MOODS)[number];

export interface TBgmTrack {
	id: string;
	title: string;
	artist?: string;
	mood: TBgmMood;
	durationSeconds: number;
	bpm?: number;
	license: "CC0";
	sourceUrl?: string;
	previewUrl?: string;
	downloadUrl?: string;
}

/**
 * Curated track list. URLs left empty until self-hosted CDN or
 * external mirror is decided. Replace sourceUrl and add downloadUrl
 * once host is determined; the catalog shape stays stable.
 */
export const BGM_LIBRARY: readonly TBgmTrack[] = [
	// Upbeat (4)
	{
		id: "upbeat-pop-001",
		title: "Sunrise Anthem",
		mood: "upbeat",
		durationSeconds: 120,
		bpm: 128,
		license: "CC0",
	},
	{
		id: "upbeat-funk-002",
		title: "Funky Stride",
		mood: "upbeat",
		durationSeconds: 90,
		bpm: 110,
		license: "CC0",
	},
	{
		id: "upbeat-rock-003",
		title: "Power Run",
		mood: "upbeat",
		durationSeconds: 105,
		bpm: 140,
		license: "CC0",
	},
	{
		id: "upbeat-pop-004",
		title: "Daylight Sprint",
		mood: "upbeat",
		durationSeconds: 95,
		bpm: 122,
		license: "CC0",
	},

	// Chill (4)
	{
		id: "chill-lofi-001",
		title: "Coffee Steam",
		mood: "chill",
		durationSeconds: 150,
		bpm: 70,
		license: "CC0",
	},
	{
		id: "chill-ambient-002",
		title: "Window Light",
		mood: "chill",
		durationSeconds: 180,
		license: "CC0",
	},
	{
		id: "chill-jazz-003",
		title: "Slow Sunday",
		mood: "chill",
		durationSeconds: 200,
		bpm: 80,
		license: "CC0",
	},
	{
		id: "chill-lofi-004",
		title: "Quiet Garden",
		mood: "chill",
		durationSeconds: 160,
		bpm: 75,
		license: "CC0",
	},

	// Emotional (4)
	{
		id: "emotional-piano-001",
		title: "Letter Home",
		mood: "emotional",
		durationSeconds: 210,
		bpm: 65,
		license: "CC0",
	},
	{
		id: "emotional-strings-002",
		title: "Last Train",
		mood: "emotional",
		durationSeconds: 180,
		bpm: 60,
		license: "CC0",
	},
	{
		id: "emotional-piano-003",
		title: "Stillwater",
		mood: "emotional",
		durationSeconds: 165,
		license: "CC0",
	},
	{
		id: "emotional-strings-004",
		title: "Distant Memory",
		mood: "emotional",
		durationSeconds: 195,
		bpm: 55,
		license: "CC0",
	},

	// Cinematic (4)
	{
		id: "cinematic-epic-001",
		title: "Horizon",
		mood: "cinematic",
		durationSeconds: 240,
		bpm: 90,
		license: "CC0",
	},
	{
		id: "cinematic-tension-002",
		title: "Crossroads",
		mood: "cinematic",
		durationSeconds: 180,
		bpm: 100,
		license: "CC0",
	},
	{
		id: "cinematic-epic-003",
		title: "Skyline Rising",
		mood: "cinematic",
		durationSeconds: 220,
		bpm: 95,
		license: "CC0",
	},
	{
		id: "cinematic-tension-004",
		title: "Threshold",
		mood: "cinematic",
		durationSeconds: 200,
		bpm: 88,
		license: "CC0",
	},

	// Electronic (4)
	{
		id: "electronic-edm-001",
		title: "Neon Pulse",
		mood: "electronic",
		durationSeconds: 150,
		bpm: 130,
		license: "CC0",
	},
	{
		id: "electronic-synthwave-002",
		title: "Night Drive",
		mood: "electronic",
		durationSeconds: 175,
		bpm: 118,
		license: "CC0",
	},
	{
		id: "electronic-edm-003",
		title: "Cyber Glow",
		mood: "electronic",
		durationSeconds: 140,
		bpm: 135,
		license: "CC0",
	},
	{
		id: "electronic-synthwave-004",
		title: "Retrograde",
		mood: "electronic",
		durationSeconds: 185,
		bpm: 110,
		license: "CC0",
	},
];

export function getBgmTrackById({
	id,
}: {
	id: string;
}): TBgmTrack | undefined {
	return BGM_LIBRARY.find((t) => t.id === id);
}

export function getBgmTracksByMood({
	mood,
}: {
	mood: TBgmMood;
}): TBgmTrack[] {
	return BGM_LIBRARY.filter((t) => t.mood === mood);
}

export function getBgmTracksByBpmRange({
	min,
	max,
}: {
	min: number;
	max: number;
}): TBgmTrack[] {
	return BGM_LIBRARY.filter((t) => {
		if (t.bpm === undefined) return false;
		return t.bpm >= min && t.bpm <= max;
	});
}
