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

const LUMINANCE_WEIGHTS = vec3f(0.299, 0.587, 0.114);

@fragment
fn fragment_main(input: VertexOutput) -> @location(0) vec4f {
    // scalars: x=exposure[-2..2], y=contrast[0..2], z=saturation[0..2]
    let exposure = uniforms.scalars.x;
    let contrast = uniforms.scalars.y;
    let saturation = uniforms.scalars.z;

    let color = textureSample(input_texture, input_sampler, input.tex_coord);
    var rgb = color.rgb;

    // Exposure (multiplicative)
    rgb = rgb * pow(2.0, exposure);

    // Contrast (push toward/away from 0.5)
    rgb = (rgb - vec3f(0.5)) * contrast + vec3f(0.5);

    // Saturation (lerp toward luminance)
    let luminance = dot(rgb, LUMINANCE_WEIGHTS);
    rgb = mix(vec3f(luminance), rgb, saturation);

    return vec4f(clamp(rgb, vec3f(0.0), vec3f(1.0)), color.a);
}
