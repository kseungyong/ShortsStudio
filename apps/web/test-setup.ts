import { mock } from "bun:test";

const TICKS_PER_SECOND_VALUE = 120_000;

// bun:test runs without a DOM; getTextMeasurementContext in the production
// code paths through OffscreenCanvas first, then document.createElement.
// Provide a Proxy-stub OffscreenCanvas so text-measurement-dependent code
// (e.g., text mask snap) does not throw on import-time eval.
if (typeof (globalThis as { OffscreenCanvas?: unknown }).OffscreenCanvas === "undefined") {
	const makeStubContext = () =>
		new Proxy(
			{},
			{
				get(_target, key) {
					if (key === "measureText") {
						return (text: string) => ({
							width: typeof text === "string" ? text.length * 10 : 0,
							actualBoundingBoxAscent: 10,
							actualBoundingBoxDescent: 2,
						});
					}
					if (typeof key === "string" && /^[A-Z]/.test(key)) return undefined;
					return (..._args: unknown[]) => undefined;
				},
				set: () => true,
			},
		);
	class StubOffscreenCanvas {
		constructor(
			public width: number = 1,
			public height: number = 1,
		) {}
		getContext(_kind: string) {
			return makeStubContext();
		}
	}
	(globalThis as { OffscreenCanvas?: unknown }).OffscreenCanvas =
		StubOffscreenCanvas;
}

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
