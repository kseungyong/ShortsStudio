import { describe, expect, test } from "bun:test";
import {
	collapseRepeats,
	containsHangul,
	normalizeSentenceEndPunctuation,
	normalizeWhitespace,
	postProcessKorean,
} from "@/transcription/post-process-ko";

describe("containsHangul", () => {
	test("detects Korean syllables", () => {
		expect(containsHangul({ text: "안녕하세요" })).toBe(true);
	});

	test("detects Korean jamo", () => {
		expect(containsHangul({ text: "ㄱㅏ" })).toBe(true);
	});

	test("returns false for English", () => {
		expect(containsHangul({ text: "Hello world" })).toBe(false);
	});

	test("returns false for empty string", () => {
		expect(containsHangul({ text: "" })).toBe(false);
	});
});

describe("collapseRepeats", () => {
	test("collapses repeating multi-syllable unit to one occurrence", () => {
		expect(collapseRepeats({ text: "안녕하세요세요세요" })).toBe("안녕하세요");
	});

	test("preserves 2 consecutive (may be legitimate)", () => {
		expect(collapseRepeats({ text: "꼬리리" })).toBe("꼬리리");
	});

	test("non-Korean strings pass through unchanged", () => {
		expect(collapseRepeats({ text: "Hello hello" })).toBe("Hello hello");
	});

	test("preserves Korean text without repeats", () => {
		expect(collapseRepeats({ text: "오늘 날씨가 좋네요" })).toBe("오늘 날씨가 좋네요");
	});

	test("collapses full multi-syllable repeating word (안녕 x3)", () => {
		expect(collapseRepeats({ text: "안녕안녕안녕" })).toBe("안녕");
	});

	test("still collapses single-syllable 3+ runs (요요요)", () => {
		expect(collapseRepeats({ text: "요요요" })).toBe("요");
	});
});

describe("normalizeSentenceEndPunctuation", () => {
	test("removes space before period", () => {
		expect(normalizeSentenceEndPunctuation({ text: "안녕하세요 ." })).toBe("안녕하세요.");
	});

	test("adds space after period if missing", () => {
		expect(normalizeSentenceEndPunctuation({ text: "안녕하세요.반갑습니다" })).toBe("안녕하세요. 반갑습니다");
	});

	test("non-Korean strings pass through unchanged", () => {
		expect(normalizeSentenceEndPunctuation({ text: "Hello .world" })).toBe("Hello .world");
	});

	test("normalizes space around commas symmetrically", () => {
		expect(normalizeSentenceEndPunctuation({ text: "안녕하세요 ,반갑습니다" })).toBe("안녕하세요, 반갑습니다");
	});
});

describe("normalizeWhitespace", () => {
	test("trims leading and trailing whitespace", () => {
		expect(normalizeWhitespace({ text: "  hello  " })).toBe("hello");
	});

	test("collapses internal double spaces", () => {
		expect(normalizeWhitespace({ text: "a  b   c" })).toBe("a b c");
	});

	test("preserves single spaces", () => {
		expect(normalizeWhitespace({ text: "a b c" })).toBe("a b c");
	});
});

describe("postProcessKorean", () => {
	test("applies the full Korean chain", () => {
		const dirty = "안녕하세요세요세요  .  반갑습니다";
		const result = postProcessKorean({ text: dirty });
		expect(result).toBe("안녕하세요. 반갑습니다");
	});

	test("English text only sees whitespace normalization", () => {
		expect(postProcessKorean({ text: "  hello  world  " })).toBe("hello world");
	});

	test("empty string returns empty", () => {
		expect(postProcessKorean({ text: "" })).toBe("");
	});
});
