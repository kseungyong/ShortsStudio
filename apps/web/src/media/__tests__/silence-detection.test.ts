import { describe, expect, test } from "bun:test";
import {
	detectSilenceRanges,
	invertSilenceRanges,
} from "@/media/silence-detection";

/**
 * Helper: synthesize an AudioBuffer-like object for tests.
 * bun:test runs in Node, so AudioBuffer isn't available; we use a minimal
 * structural mock that matches what detectSilenceRanges actually reads.
 */
function makeBuffer({
	channels,
	sampleRate,
}: {
	channels: Float32Array[];
	sampleRate: number;
}): AudioBuffer {
	const length = channels[0]?.length ?? 0;
	// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
	return {
		numberOfChannels: channels.length,
		sampleRate,
		length,
		duration: length / sampleRate,
		getChannelData: (c: number) => channels[c] ?? new Float32Array(0),
		copyFromChannel: () => {},
		copyToChannel: () => {},
	} as unknown as AudioBuffer;
}

describe("detectSilenceRanges", () => {
	test("empty buffer returns no ranges", () => {
		const buffer = makeBuffer({
			channels: [new Float32Array(0)],
			sampleRate: 44100,
		});
		expect(detectSilenceRanges({ buffer })).toEqual([]);
	});

	test("all-silent buffer of 1s returns one full-range entry", () => {
		const sampleRate = 1000;
		const samples = new Float32Array(sampleRate); // all zeros
		const buffer = makeBuffer({ channels: [samples], sampleRate });
		const ranges = detectSilenceRanges({ buffer });
		expect(ranges.length).toBe(1);
		expect(ranges[0]?.startSeconds).toBeCloseTo(0, 3);
		expect(ranges[0]?.endSeconds).toBeCloseTo(1, 3);
	});

	test("buffer with no silence returns no ranges", () => {
		const sampleRate = 1000;
		const samples = new Float32Array(sampleRate);
		samples.fill(0.5); // loud
		const buffer = makeBuffer({ channels: [samples], sampleRate });
		expect(detectSilenceRanges({ buffer })).toEqual([]);
	});

	test("short silence below minDuration is ignored", () => {
		const sampleRate = 1000;
		const samples = new Float32Array(sampleRate);
		samples.fill(0.5);
		// Insert 0.1s of silence (default min is 0.5s)
		for (let i = 200; i < 300; i++) samples[i] = 0;
		const buffer = makeBuffer({ channels: [samples], sampleRate });
		expect(detectSilenceRanges({ buffer })).toEqual([]);
	});

	test("silence longer than minDuration is detected", () => {
		const sampleRate = 1000;
		const samples = new Float32Array(2 * sampleRate); // 2 seconds total
		samples.fill(0.5);
		// Insert 0.8s of silence at samples 500..1300
		for (let i = 500; i < 1300; i++) samples[i] = 0;
		const buffer = makeBuffer({ channels: [samples], sampleRate });
		const ranges = detectSilenceRanges({ buffer });
		expect(ranges.length).toBe(1);
		expect(ranges[0]?.startSeconds).toBeCloseTo(0.5, 1);
		expect(ranges[0]?.endSeconds).toBeCloseTo(1.3, 1);
	});

	test("custom threshold detects quiet but non-zero audio as silent", () => {
		const sampleRate = 1000;
		const samples = new Float32Array(sampleRate);
		samples.fill(0.005); // below threshold 0.01 default
		const buffer = makeBuffer({ channels: [samples], sampleRate });
		const ranges = detectSilenceRanges({ buffer });
		expect(ranges.length).toBe(1);
	});

	test("higher threshold catches more silence", () => {
		const sampleRate = 1000;
		const samples = new Float32Array(sampleRate);
		samples.fill(0.05); // above default but below stricter
		const buffer = makeBuffer({ channels: [samples], sampleRate });
		const defaultRanges = detectSilenceRanges({ buffer });
		const strictRanges = detectSilenceRanges({
			buffer,
			options: { thresholdRms: 0.1 },
		});
		expect(defaultRanges.length).toBe(0);
		expect(strictRanges.length).toBe(1);
	});

	test("custom minDuration affects detection", () => {
		const sampleRate = 1000;
		const samples = new Float32Array(sampleRate);
		samples.fill(0.5);
		for (let i = 200; i < 350; i++) samples[i] = 0; // 0.15s silence
		const buffer = makeBuffer({ channels: [samples], sampleRate });
		const defaultRanges = detectSilenceRanges({ buffer });
		const lenientRanges = detectSilenceRanges({
			buffer,
			options: { minDurationSeconds: 0.1 },
		});
		expect(defaultRanges.length).toBe(0);
		expect(lenientRanges.length).toBe(1);
	});

	test("stereo buffer: loud channel prevents silence detection", () => {
		const sampleRate = 1000;
		const silent = new Float32Array(sampleRate); // all zeros
		const loud = new Float32Array(sampleRate);
		loud.fill(0.5);
		const buffer = makeBuffer({ channels: [silent, loud], sampleRate });
		expect(detectSilenceRanges({ buffer })).toEqual([]);
	});

	test("stereo buffer: both channels silent is detected as one range", () => {
		const sampleRate = 1000;
		const buffer = makeBuffer({
			channels: [new Float32Array(sampleRate), new Float32Array(sampleRate)],
			sampleRate,
		});
		const ranges = detectSilenceRanges({ buffer });
		expect(ranges.length).toBe(1);
		expect(ranges[0]?.startSeconds).toBeCloseTo(0, 3);
		expect(ranges[0]?.endSeconds).toBeCloseTo(1, 3);
	});
});

describe("invertSilenceRanges", () => {
	test("empty silence + positive duration returns one keep range", () => {
		const keep = invertSilenceRanges({
			silenceRanges: [],
			totalDurationSeconds: 5,
		});
		expect(keep).toEqual([{ startSeconds: 0, endSeconds: 5 }]);
	});

	test("zero duration returns no keep ranges", () => {
		const keep = invertSilenceRanges({
			silenceRanges: [],
			totalDurationSeconds: 0,
		});
		expect(keep).toEqual([]);
	});

	test("single silence at start drops front, keeps back", () => {
		const keep = invertSilenceRanges({
			silenceRanges: [{ startSeconds: 0, endSeconds: 2 }],
			totalDurationSeconds: 5,
		});
		expect(keep).toEqual([{ startSeconds: 2, endSeconds: 5 }]);
	});

	test("single silence at end drops back, keeps front", () => {
		const keep = invertSilenceRanges({
			silenceRanges: [{ startSeconds: 3, endSeconds: 5 }],
			totalDurationSeconds: 5,
		});
		expect(keep).toEqual([{ startSeconds: 0, endSeconds: 3 }]);
	});

	test("middle silence yields two keep ranges", () => {
		const keep = invertSilenceRanges({
			silenceRanges: [{ startSeconds: 2, endSeconds: 3 }],
			totalDurationSeconds: 5,
		});
		expect(keep).toEqual([
			{ startSeconds: 0, endSeconds: 2 },
			{ startSeconds: 3, endSeconds: 5 },
		]);
	});

	test("multiple overlapping silences handled", () => {
		const keep = invertSilenceRanges({
			silenceRanges: [
				{ startSeconds: 1, endSeconds: 2 },
				{ startSeconds: 1.5, endSeconds: 3 }, // overlaps with above
				{ startSeconds: 4, endSeconds: 4.5 },
			],
			totalDurationSeconds: 5,
		});
		expect(keep).toEqual([
			{ startSeconds: 0, endSeconds: 1 },
			{ startSeconds: 3, endSeconds: 4 },
			{ startSeconds: 4.5, endSeconds: 5 },
		]);
	});

	test("silence spanning full buffer yields no keep ranges", () => {
		const keep = invertSilenceRanges({
			silenceRanges: [{ startSeconds: 0, endSeconds: 5 }],
			totalDurationSeconds: 5,
		});
		expect(keep).toEqual([]);
	});
});
