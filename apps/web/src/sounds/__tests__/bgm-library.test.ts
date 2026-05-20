import { describe, expect, test } from "bun:test";
import {
	BGM_LIBRARY,
	BGM_MOODS,
	type TBgmMood,
	getBgmTrackById,
	getBgmTracksByBpmRange,
	getBgmTracksByMood,
} from "@/sounds/bgm-library";

describe("BGM_LIBRARY", () => {
	test("contains 20 tracks total", () => {
		expect(BGM_LIBRARY.length).toBe(20);
	});

	test("has 4 tracks per mood (5 moods × 4 = 20)", () => {
		for (const mood of BGM_MOODS) {
			const tracks = BGM_LIBRARY.filter((t) => t.mood === mood);
			expect(tracks.length).toBe(4);
		}
	});

	test("every track has unique id", () => {
		const ids = BGM_LIBRARY.map((t) => t.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	test("every track has non-empty title", () => {
		for (const track of BGM_LIBRARY) {
			expect(track.title).toMatch(/\S/);
		}
	});

	test("artist when present is non-empty", () => {
		for (const track of BGM_LIBRARY) {
			if (track.artist !== undefined) {
				expect(track.artist).toMatch(/\S/);
			}
		}
	});

	test("every track has positive duration", () => {
		for (const track of BGM_LIBRARY) {
			expect(track.durationSeconds).toBeGreaterThan(0);
		}
	});

	test("every track licenses as CC0", () => {
		for (const track of BGM_LIBRARY) {
			expect(track.license).toBe("CC0");
		}
	});

	test("tracks with bpm have plausible values", () => {
		for (const track of BGM_LIBRARY) {
			if (track.bpm !== undefined) {
				expect(track.bpm).toBeGreaterThanOrEqual(40);
				expect(track.bpm).toBeLessThanOrEqual(200);
			}
		}
	});
});

describe("getBgmTrackById", () => {
	test("returns track for valid id", () => {
		const track = getBgmTrackById({ id: "upbeat-pop-001" });
		expect(track).toBeDefined();
		expect(track?.title).toBe("Sunrise Anthem");
	});

	test("returns undefined for unknown id", () => {
		const track = getBgmTrackById({ id: "nope-xyz" });
		expect(track).toBeUndefined();
	});
});

describe("getBgmTracksByMood", () => {
	test("returns 4 tracks for each mood", () => {
		for (const mood of BGM_MOODS) {
			const tracks = getBgmTracksByMood({ mood });
			expect(tracks.length).toBe(4);
			for (const track of tracks) {
				expect(track.mood).toBe(mood);
			}
		}
	});

	test("returns empty array for unknown mood (TS-narrowed but defensive)", () => {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
		const tracks = getBgmTracksByMood({ mood: "nope" as unknown as TBgmMood });
		expect(tracks).toEqual([]);
	});
});

describe("getBgmTracksByBpmRange", () => {
	test("returns tracks with bpm in [min, max]", () => {
		const tracks = getBgmTracksByBpmRange({ min: 100, max: 130 });
		for (const track of tracks) {
			expect(track.bpm).toBeGreaterThanOrEqual(100);
			expect(track.bpm).toBeLessThanOrEqual(130);
		}
	});

	test("excludes tracks without bpm", () => {
		const tracks = getBgmTracksByBpmRange({ min: 0, max: 1000 });
		for (const track of tracks) {
			expect(track.bpm).toBeDefined();
		}
	});

	test("empty range returns empty array", () => {
		const tracks = getBgmTracksByBpmRange({ min: 500, max: 600 });
		expect(tracks).toEqual([]);
	});
});
