import { mock } from "bun:test";

const TICKS_PER_SECOND_VALUE = 120_000;

mock.module("opencut-wasm", () => ({
	TICKS_PER_SECOND: () => TICKS_PER_SECOND_VALUE,
	mediaTimeFromSeconds: ({ seconds }: { seconds: number }) =>
		Math.round(seconds * TICKS_PER_SECOND_VALUE),
	mediaTimeToSeconds: ({ time }: { time: number }) =>
		time / TICKS_PER_SECOND_VALUE,
	roundToFrame: ({ time }: { time: number }) => time,
	lastFrameTime: ({ duration }: { duration: number }) => duration,
	snappedSeekTime: ({ time }: { time: number }) => time,
	parseTimecode: () => undefined,
	formatTimecode: () => "00:00:00:00",
}));
