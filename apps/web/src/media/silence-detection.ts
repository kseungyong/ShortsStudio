/**
 * Silence detection — given an audio buffer, identify time ranges (in seconds)
 * where the RMS amplitude falls below a threshold for a minimum duration.
 *
 * Used by the Silence Remover feature to suggest clip cuts. Pure analysis;
 * does not modify any timeline state.
 */

const ANALYSIS_WINDOW_SECONDS = 0.02;
const DEFAULT_SILENCE_THRESHOLD_RMS = 0.01;
const DEFAULT_MIN_SILENCE_DURATION_SECONDS = 0.5;

export interface TSilenceRange {
	/** Start time of the silent region in seconds. */
	startSeconds: number;
	/** End time of the silent region in seconds. */
	endSeconds: number;
}

export interface TDetectSilenceOptions {
	/**
	 * RMS amplitude below which a window is considered silent. Default 0.01
	 * (roughly -40 dBFS).
	 */
	thresholdRms?: number;
	/**
	 * Minimum continuous duration (in seconds) of below-threshold samples
	 * to qualify as a silence range. Shorter runs are ignored. Default 0.5s.
	 */
	minDurationSeconds?: number;
}

function computeWindowRms({
	buffer,
	windowStart,
	windowEnd,
}: {
	buffer: AudioBuffer;
	windowStart: number;
	windowEnd: number;
}): number {
	const channels = buffer.numberOfChannels;
	let sumOfSquares = 0;
	let sampleCount = 0;

	for (let c = 0; c < channels; c++) {
		const data = buffer.getChannelData(c);
		for (let i = windowStart; i < windowEnd; i++) {
			const sample = data[i] ?? 0;
			sumOfSquares += sample * sample;
			sampleCount++;
		}
	}

	if (sampleCount === 0) return 0;
	return Math.sqrt(sumOfSquares / sampleCount);
}

/**
 * Detect silent ranges in an audio buffer.
 *
 * Algorithm:
 *   1. Slide a fixed-size window (20ms) across the buffer.
 *   2. For each window, compute RMS amplitude across all channels.
 *   3. Mark contiguous runs of below-threshold windows as candidate ranges.
 *   4. Discard candidates shorter than minDurationSeconds.
 *   5. Return surviving ranges sorted by start time.
 *
 * Boundary precision: range endpoints are quantized to the analysis window
 * size (20ms). This is below human perception of silence onset/offset, so
 * it's acceptable for a silence-remover workflow.
 */
export function detectSilenceRanges({
	buffer,
	options = {},
}: {
	buffer: AudioBuffer;
	options?: TDetectSilenceOptions;
}): TSilenceRange[] {
	const threshold = options.thresholdRms ?? DEFAULT_SILENCE_THRESHOLD_RMS;
	const minDuration =
		options.minDurationSeconds ?? DEFAULT_MIN_SILENCE_DURATION_SECONDS;
	const sampleRate = buffer.sampleRate;
	const totalSamples = buffer.length;

	if (totalSamples === 0 || sampleRate === 0) return [];

	const windowSamples = Math.max(
		1,
		Math.floor(ANALYSIS_WINDOW_SECONDS * sampleRate),
	);
	const ranges: TSilenceRange[] = [];

	let runStartSample: number | null = null;

	for (
		let windowStart = 0;
		windowStart < totalSamples;
		windowStart += windowSamples
	) {
		const windowEnd = Math.min(windowStart + windowSamples, totalSamples);
		const rms = computeWindowRms({ buffer, windowStart, windowEnd });

		if (rms < threshold) {
			if (runStartSample === null) runStartSample = windowStart;
		} else if (runStartSample !== null) {
			const runEndSample = windowStart;
			const durationSeconds = (runEndSample - runStartSample) / sampleRate;
			if (durationSeconds >= minDuration) {
				ranges.push({
					startSeconds: runStartSample / sampleRate,
					endSeconds: runEndSample / sampleRate,
				});
			}
			runStartSample = null;
		}
	}

	// Close out a trailing run that extends to end of buffer
	if (runStartSample !== null) {
		const durationSeconds = (totalSamples - runStartSample) / sampleRate;
		if (durationSeconds >= minDuration) {
			ranges.push({
				startSeconds: runStartSample / sampleRate,
				endSeconds: totalSamples / sampleRate,
			});
		}
	}

	return ranges;
}

/**
 * Given silence ranges, compute the non-silent ranges (the "keepable" segments).
 * Useful for downstream "split clip and remove silent gaps" UX.
 */
export function invertSilenceRanges({
	silenceRanges,
	totalDurationSeconds,
}: {
	silenceRanges: TSilenceRange[];
	totalDurationSeconds: number;
}): TSilenceRange[] {
	if (totalDurationSeconds <= 0) return [];
	if (silenceRanges.length === 0) {
		return [{ startSeconds: 0, endSeconds: totalDurationSeconds }];
	}

	const sorted = [...silenceRanges].sort(
		(a, b) => a.startSeconds - b.startSeconds,
	);
	const keep: TSilenceRange[] = [];
	let cursor = 0;

	for (const range of sorted) {
		if (range.startSeconds > cursor) {
			keep.push({ startSeconds: cursor, endSeconds: range.startSeconds });
		}
		cursor = Math.max(cursor, range.endSeconds);
	}

	if (cursor < totalDurationSeconds) {
		keep.push({ startSeconds: cursor, endSeconds: totalDurationSeconds });
	}

	return keep;
}
