import { DraggableItem } from "@/components/editor/panels/assets/draggable-item";
import { PanelView } from "@/components/editor/panels/assets/views/base-panel";
import { useEditor } from "@/editor/use-editor";
import { DEFAULTS } from "@/timeline/defaults";
import { buildTextElement } from "@/timeline/element-utils";
import {
	TEXT_OVERLAY_PRESETS,
	type TTextOverlayPreset,
	buildTextOverlayPresetParams,
} from "@/text/text-overlay-presets";
import type { MediaTime } from "@/wasm";

export function TextView() {
	const editor = useEditor();

	const handleAddDefaultToTimeline = ({
		currentTime,
	}: {
		currentTime: MediaTime;
	}) => {
		const activeScene = editor.scenes.getActiveScene();
		if (!activeScene) return;

		const element = buildTextElement({
			raw: DEFAULTS.text.element,
			startTime: currentTime,
		});

		editor.timeline.insertElement({
			element,
			placement: { mode: "auto" },
		});
	};

	const handleAddPresetToTimeline = ({
		preset,
		currentTime,
	}: {
		preset: TTextOverlayPreset;
		currentTime: MediaTime;
	}) => {
		const activeScene = editor.scenes.getActiveScene();
		if (!activeScene) return;

		const presetParams = buildTextOverlayPresetParams({ style: preset.style });

		const element = buildTextElement({
			raw: {
				name: preset.label,
				params: {
					...DEFAULTS.text.element.params,
					...presetParams,
					content: preset.label,
				},
			},
			startTime: currentTime,
		});

		editor.timeline.insertElement({
			element,
			placement: { mode: "auto" },
		});
	};

	return (
		<PanelView title="Text">
			<div
				className="grid gap-3"
				style={{ gridTemplateColumns: "repeat(auto-fill, minmax(7rem, 1fr))" }}
			>
				<DraggableItem
					name="Default text"
					preview={
						<div className="bg-accent flex size-full items-center justify-center rounded">
							<span className="text-xs select-none">Default text</span>
						</div>
					}
					dragData={{
						id: "temp-text-id",
						type: DEFAULTS.text.element.type,
						name: DEFAULTS.text.element.name,
						content: "Default text",
					}}
					aspectRatio={1}
					onAddToTimeline={handleAddDefaultToTimeline}
					shouldShowLabel
				/>
				{TEXT_OVERLAY_PRESETS.map((preset) => (
					<DraggableItem
						key={preset.id}
						name={preset.label}
						preview={<TextPresetPreview preset={preset} />}
						dragData={{
							id: `text-preset-${preset.id}`,
							type: "text",
							name: preset.label,
							content: preset.label,
							params: buildTextOverlayPresetParams({ style: preset.style }),
						}}
						aspectRatio={1}
						onAddToTimeline={({ currentTime }) =>
							handleAddPresetToTimeline({ preset, currentTime })
						}
						shouldShowLabel
					/>
				))}
			</div>
		</PanelView>
	);
}

function TextPresetPreview({ preset }: { preset: TTextOverlayPreset }) {
	const { style } = preset;
	const bg = style.background;
	const hasBg = !!bg && bg.enabled !== false && !!bg.color;

	return (
		<div className="bg-accent flex size-full items-center justify-center overflow-hidden rounded p-2">
			<span
				className="block max-w-full truncate text-center"
				style={{
					color: style.color,
					fontWeight: style.fontWeight === "bold" ? 700 : 400,
					fontStyle: style.fontStyle === "italic" ? "italic" : "normal",
					fontFamily: style.fontFamily,
					letterSpacing:
						style.letterSpacing !== undefined
							? `${style.letterSpacing}px`
							: undefined,
					backgroundColor: hasBg ? bg.color : undefined,
					padding: hasBg ? "2px 6px" : undefined,
					borderRadius:
						hasBg && bg.cornerRadius !== undefined
							? Math.min(bg.cornerRadius, 16)
							: undefined,
					fontSize: "0.7rem",
				}}
			>
				Aa
			</span>
		</div>
	);
}
