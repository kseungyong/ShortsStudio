struct VertexOutput {
    @builtin(position) position: vec4f,
    @location(0) tex_coord: vec2f,
}

struct EffectUniforms {
    resolution: vec2f,
    direction: vec2f,
    scalars: vec4f,
}

@group(0) @binding(0) var input_texture: texture_2d<f32>;
@group(0) @binding(1) var input_sampler: sampler;
@group(1) @binding(0) var<uniform> uniforms: EffectUniforms;

@fragment
fn fragment_main(input: VertexOutput) -> @location(0) vec4f {
    // scalars: x=intensity[0..1], y=falloff[0..1], z=center_x[0..1], w=center_y[0..1]
    let intensity = uniforms.scalars.x;
    let falloff = uniforms.scalars.y;
    let center = vec2f(uniforms.scalars.z, uniforms.scalars.w);

    let color = textureSample(input_texture, input_sampler, input.tex_coord);

    let raw_distance = length(input.tex_coord - center);
    // UV space diagonal from center to corner is sqrt(0.5) ≈ 0.7071.
    // Normalize so distance=1.0 at corner — otherwise intensity=1 only reaches ~58% darken.
    let distance = raw_distance / 0.7071;
    // smoothstep gradient: 0 inside falloff threshold, 1 at radius 1
    let vignette = 1.0 - smoothstep(falloff, 1.0, distance) * intensity;

    return vec4f(color.rgb * vignette, color.a);
}
