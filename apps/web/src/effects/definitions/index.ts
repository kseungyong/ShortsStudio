import { effectsRegistry } from "../registry";
import { blurEffectDefinition } from "./blur";
import { sharpenEffectDefinition } from "./sharpen";
import { vignetteEffectDefinition } from "./vignette";

const defaultEffects = [
	blurEffectDefinition,
	vignetteEffectDefinition,
	sharpenEffectDefinition,
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
