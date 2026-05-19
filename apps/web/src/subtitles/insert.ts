import type { EditorCore } from "@/core";
import {
	AddTrackCommand,
	BatchCommand,
	InsertElementCommand,
} from "@/commands";
import { buildSubtitleTextElement } from "./build-subtitle-text-element";
import type { TCaptionStylePresetId } from "./caption-style-presets";
import { getCaptionStylePresetById } from "./caption-style-presets";
import type { SubtitleCue, SubtitleStyleOverrides } from "./types";

function applyPresetStyle({
	caption,
	preset,
}: {
	caption: SubtitleCue;
	preset?: SubtitleStyleOverrides;
}): SubtitleCue {
	if (!preset) return caption;
	return {
		...caption,
		style: { ...preset, ...(caption.style ?? {}) },
	};
}

export function insertCaptionChunksAsTextTrack({
	editor,
	captions,
	stylePresetId,
}: {
	editor: EditorCore;
	captions: SubtitleCue[];
	stylePresetId?: TCaptionStylePresetId;
}): string | null {
	if (captions.length === 0) {
		return null;
	}

	const presetStyle = stylePresetId
		? getCaptionStylePresetById({ id: stylePresetId })?.style
		: undefined;
	const styledCaptions = captions.map((c) =>
		applyPresetStyle({ caption: c, preset: presetStyle }),
	);

	const addTrackCommand = new AddTrackCommand({ type: "text", index: 0 });
	const trackId = addTrackCommand.getTrackId();
	const canvasSize = editor.project.getActive().settings.canvasSize;
	const insertCommands = styledCaptions.map(
		(caption, index) =>
			new InsertElementCommand({
				placement: { mode: "explicit", trackId },
				element: buildSubtitleTextElement({
					index,
					caption,
					canvasSize,
				}),
			}),
	);
	editor.command.execute({
		command: new BatchCommand([addTrackCommand, ...insertCommands]),
	});

	return trackId;
}
