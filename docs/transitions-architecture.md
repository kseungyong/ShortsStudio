# Transitions Architecture

## Problem

Cross-dissolve is implementable as a per-clip alpha multiplier (see `apps/web/src/transitions/cross-dissolve.ts`). It needs only single-input compositing math and slots cleanly into the existing per-clip alpha path.

Other Shorts-relevant transitions do not:

- **slide (L/R/U/D)** — incoming clip translates in while outgoing translates out; pixels of both clips are visible simultaneously in non-overlapping spatial regions.
- **zoom (in/out)** — one clip scales while the other fades; both are co-rendered with different transforms.
- **whip-pan** — motion-blurred sweep between clips; needs a per-frame velocity term applied to both inputs.
- **glitch** — channel-displaced both inputs with noise overlay; both inputs sampled by the shader per fragment.

All four need **two simultaneous input textures** at the shader level. ShortsStudio's current `EffectDefinition` (`apps/web/src/effects/types.ts`) takes one input — the current pixel buffer. The compositor (`rust/crates/compositor`) currently composes per-clip, not per-clip-pair.

## Proposed Architecture

### Layer 1 — Transition definition (TS)

Parallel to `EffectDefinition`, introduce `TransitionDefinition`:

```ts
interface TransitionDefinition {
  kind: TTransitionKindId;
  name: string;
  params: ParamDefinition[];
  renderer: {
    shader: string;
    uniforms: (args: {
      progress: number;
      params: ParamValues;
      width: number;
      height: number;
    }) => Record<string, EffectUniformValue>;
  };
}
```

The shader is a special kind that takes two input textures (`u_outgoing`, `u_incoming`) plus uniforms.

### Layer 2 — Compositor support (Rust/WASM)

`rust/crates/compositor` needs:

- A new pass type "transition-pass" that binds two input textures
- The texture pool needs to keep both incoming and outgoing frames available during the overlap window
- A way for the timeline to declare "frames `t0..t1` are a transition region between clip A and clip B"

This is a real change to `rust/crates/compositor/src/compositor.rs` and likely `rust/wasm/src/compositor.rs`.

### Layer 3 — Timeline model

A "transition region" is a property of a CLIP PAIR, not a single clip. Suggested representation:

```ts
interface TimelineTransition {
  fromClipId: string;
  toClipId: string;
  kind: TTransitionKindId;
  overlapDurationSeconds: number;
  params: ParamValues;
}
```

Stored on the scene/track alongside elements. UI drag-onto-clip-edge gesture creates one.

### Layer 4 — Renderer dispatch

When the renderer encounters a timeline region overlapping two clips with a `TimelineTransition`, instead of compositing them sequentially with normal alpha, it:

1. Renders outgoing clip → texture A
2. Renders incoming clip → texture B
3. Submits transition pass with both as inputs and progress uniform
4. Resulting texture is the composite for that frame

## Shader Sketches

### Slide (horizontal)

```wgsl
@fragment
fn fs_slide(@location(0) uv: vec2<f32>) -> @location(0) vec4<f32> {
    let p = uniforms.progress;
    let dir = uniforms.direction; // -1 (right→left) or +1
    let outgoing_uv = vec2(uv.x + p * dir, uv.y);
    let incoming_uv = vec2(uv.x + (p - 1.0) * dir, uv.y);
    // sample each, return whichever is in-bounds
}
```

### Zoom (in)

```wgsl
let scale = 1.0 + p * 0.3;
let centered_uv = (uv - 0.5) / scale + 0.5;
// sample outgoing at centered_uv, alpha = 1 - p
// sample incoming at uv, alpha = p
```

### Whip pan

```wgsl
let blur_amount = sin(p * PI) * MAX_BLUR;
// motion blur both samples + slide
```

### Glitch

```wgsl
let noise = fract(sin(uv.y * 12.0 + time) * 43758.0);
let channel_offset = noise * (1.0 - abs(p - 0.5) * 2.0) * 0.05;
// sample outgoing.r at uv + channel_offset, .g at uv, .b at uv - channel_offset
// blend toward incoming as p approaches 0.5
```

## Implementation Plan (Wave 4+)

1. **PR A:** `TransitionDefinition` type + registry (TS-only). No compositor changes yet.
2. **PR B:** Compositor `transition-pass` type and two-texture binding in `rust/crates/compositor`. Slide shader.
3. **PR C:** Timeline model — `TimelineTransition` on scene. Migration v32 to preserve existing projects.
4. **PR D:** Renderer dispatch — when timeline region has transition, route to transition pass.
5. **PR E:** Shaders for zoom, whip-pan, glitch (one PR per shader for review tractability).
6. **PR F:** UI — drag-onto-clip-edge gesture, transition picker.

## Risks

- **Texture pool memory pressure:** Holding two full-resolution textures during overlap doubles GPU memory for that region. For 1080×1920 mp4 Shorts (~8 MB per RGBA frame), this is acceptable. For 4K it could be tight.
- **wgpu validation issue (#768):** Two-texture binding may trigger different validation paths on older GPUs. Test on broad GPU matrix before shipping.
- **Timeline UX:** Existing OpenCut UI does not have transition affordance. Wave 4 PR F is a real UX design task, not just code.

## Out of Scope for This Doc

- 3D transitions (camera rotation, cube)
- Time-warp transitions (incoming clip rewinds while outgoing plays forward)
- Audio crossfades (separately handled in audio mixer)
