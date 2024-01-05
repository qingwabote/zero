import { BlendFactor, BlendState, CommandBuffer, CullMode, PassState, PrimitiveTopology, RasterizationState, RenderPass, ShaderStageFlagBits } from "gfx";
import { VisibilityFlagBits } from "../../VisibilityFlagBits.js";
import { Shader } from "../../assets/Shader.js";
import { Context } from "../../core/render/Context.js";
import { Phase } from "../../core/render/pipeline/Phase.js";
import { createInputAssembler } from "../../core/render/quad.js";
import { shaderLib } from "../../core/shaderLib.js";

const vs = `
layout(location = 0) in vec4 a_position;
layout(location = 1) in vec2 a_texCoord;

layout(location = 0) out vec2 v_uv;

void main() {
    v_uv = a_texCoord;
    gl_Position = a_position;
}`

const fs = `
precision highp float;

layout(location = 0) in vec2 v_uv;

layout(set = 0, binding = 0) uniform sampler2D albedoMap;

layout(location = 0) out vec4 v_color;

void main() {
    v_color = texture(albedoMap, v_uv);
}`

const shaderAsset = new Shader;
shaderAsset.name = 'a post shader';
shaderAsset.sources.push(vs);
shaderAsset.types.push(ShaderStageFlagBits.VERTEX);
shaderAsset.sources.push(fs);
shaderAsset.types.push(ShaderStageFlagBits.FRAGMENT);

const shader = shaderLib.getShader(shaderAsset);

const rasterizationState = new RasterizationState;
rasterizationState.cullMode = CullMode.NONE;

const blendState = new BlendState;
blendState.srcRGB = BlendFactor.SRC_ALPHA;
blendState.dstRGB = BlendFactor.ONE_MINUS_SRC_ALPHA;
blendState.srcAlpha = BlendFactor.ONE;
blendState.dstAlpha = BlendFactor.ONE_MINUS_SRC_ALPHA

const passState = new PassState;
passState.shader = shader;
passState.primitive = PrimitiveTopology.TRIANGLE_LIST;
passState.rasterizationState = rasterizationState;
passState.blendState = blendState;

const inputAssembler = createInputAssembler(2, 2, true);

export class PostPhase extends Phase {
    constructor(context: Context, visibility: VisibilityFlagBits = VisibilityFlagBits.ALL) {
        super(context, visibility);
    }

    record(commandBuffer: CommandBuffer, renderPass: RenderPass): number {
        const pipeline = this._context.getPipeline(passState, inputAssembler, renderPass);
        commandBuffer.bindPipeline(pipeline);
        commandBuffer.bindInputAssembler(inputAssembler);
        commandBuffer.drawIndexed(6, 0)
        return 1;
    }
}