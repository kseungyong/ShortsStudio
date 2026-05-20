/**
 * Korean transcription post-processing.
 *
 * Whisper output for Korean often has:
 * - Missing or excessive spaces between words
 * - Repeated character / multi-syllable loops (e.g. "안녕하세요세요세요")
 * - Inconsistent sentence-ending particles vs. typed convention
 *
 * Korean-only operations (`collapseRepeats`, `normalizeSentenceEndPunctuation`)
 * short-circuit on non-Korean input. Whitespace normalization is language-
 * agnostic and applies to all inputs as a final cleanup step.
 */

const HANGUL_REGEX = /[ㄱ-ㅣ가-힣]/;

export function containsHangul({ text }: { text: string }): boolean {
	return HANGUL_REGEX.test(text);
}

/**
 * Collapse repeating Hangul patterns to a single occurrence.
 *
 * Two passes:
 *   1. Multi-syllable unit (2+ chars) repeated 3+ times: collapse to one
 *      occurrence of the unit.
 *      Example: "안녕하세요세요세요" — the trailing "세요세요세요" matches as
 *      "세요" × 3, collapsed to "세요" → result "안녕하세요"
 *   2. Single syllable repeated 3+ times: collapse to one.
 *      Example: "요요요" → "요"
 *
 * Conservative: preserves 2 consecutive occurrences (often legitimate).
 */
export function collapseRepeats({ text }: { text: string }): string {
	if (!containsHangul({ text })) return text;
	// Pass 1: multi-syllable repeating groups, e.g. "세요세요세요" → "세요"
	const step1 = text.replace(/([가-힣]{2,})\1{2,}/g, "$1");
	// Pass 2: single syllable repeated 3+ times, e.g. "요요요" → "요"
	return step1.replace(/([가-힣])\1{2,}/g, "$1");
}

/**
 * Normalize whitespace around sentence-ending particles. Whisper sometimes
 * produces "안녕하세요 . 반갑습니다" — move period adjacent to text.
 */
export function normalizeSentenceEndPunctuation({
	text,
}: {
	text: string;
}): string {
	if (!containsHangul({ text })) return text;
	return text
		.replace(/\s+([.!?,])/g, "$1")
		.replace(/([.!?,])([^\s])/g, "$1 $2");
}

/**
 * Trim leading and trailing whitespace and collapse internal runs of 2+
 * spaces. Language-agnostic but useful as part of the Korean cleanup chain.
 */
export function normalizeWhitespace({ text }: { text: string }): string {
	return text.trim().replace(/\s{2,}/g, " ");
}

/**
 * Apply the full Korean cleanup chain. Non-Korean text passes through with
 * only basic whitespace normalization.
 */
export function postProcessKorean({ text }: { text: string }): string {
	const collapsed = collapseRepeats({ text });
	const punctuated = normalizeSentenceEndPunctuation({ text: collapsed });
	return normalizeWhitespace({ text: punctuated });
}
