import { effectsRegistry } from "../registry";
import { blurEffectDefinition } from "./blur";
import { chromaticAberrationEffectDefinition } from "./chromatic-aberration";
import { colorGradeEffectDefinition } from "./color-grade";
import { sharpenEffectDefinition } from "./sharpen";
import { vignetteEffectDefinition } from "./vignette";

const defaultEffects = [
	blurEffectDefinition,
	vignetteEffectDefinition,
	sharpenEffectDefinition,
	colorGradeEffectDefinition,
	chromaticAberrationEffectDefinition,
];

export function registerDefaultEffects(): void {
	for (const definition of defaultEffects) {
		if (effectsRegistry.has(definition.type)) {
			continue;
		}
		effectsRegistry.register({
			key: definition.type,
			definition,
		});
	}
}
