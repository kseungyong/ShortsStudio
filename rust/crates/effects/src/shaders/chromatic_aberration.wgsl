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
    // scalars: x=amount[0..0.05] (UV-space offset), y=angle_radians
    let amount = uniforms.scalars.x;
    let angle = uniforms.scalars.y;

    let offset = vec2f(cos(angle), sin(angle)) * amount;

    let r_sample = textureSample(input_texture, input_sampler, input.tex_coord + offset);
    let g_sample = textureSample(input_texture, input_sampler, input.tex_coord);
    let b_sample = textureSample(input_texture, input_sampler, input.tex_coord - offset);

    return vec4f(r_sample.r, g_sample.g, b_sample.b, g_sample.a);
}
