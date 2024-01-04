import { device } from "boot";
import { BlendFactor, BlendState, BufferInfo, BufferUsageFlagBits, CommandBuffer, CullMode, Format, FormatInfos, IndexInput, IndexType, InputAssemblerInfo, MemoryUsage, PassState, PrimitiveTopology, RasterizationState, RenderPass, ShaderStageFlagBits, VertexAttribute, VertexInput, VertexInputAttributeDescription, VertexInputBindingDescription, VertexInputRate, VertexInputState } from "gfx";
import { VisibilityFlagBits } from "../../VisibilityFlagBits.js";
import { Shader } from "../../assets/Shader.js";
import { Context } from "../../core/render/Context.js";
import { Phase } from "../../core/render/pipeline/Phase.js";
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
    v_color = texture(albedoMap, vec2(v_uv.x, 1.0 - v_uv.y));
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

const a_position = new VertexAttribute;
a_position.name = 'a_position';
a_position.format = Format.RGB32_SFLOAT;
a_position.offset = 0;
a_position.buffer = 0;

const a_texCoord = new VertexAttribute;
a_texCoord.name = 'a_texCoord';
a_texCoord.format = Format.RG32_SFLOAT;
a_texCoord.offset = FormatInfos[a_position.format].bytes;
a_texCoord.buffer = 0;

const vertexInputBindingDescription = new VertexInputBindingDescription;
vertexInputBindingDescription.inputRate = VertexInputRate.VERTEX;
vertexInputBindingDescription.stride = FormatInfos[a_position.format].bytes + FormatInfos[a_texCoord.format].bytes;
vertexInputBindingDescription.binding = 0;

const a_position_description = new VertexInputAttributeDescription;
a_position_description.location = 0;
a_position_description.format = a_position.format;
a_position_description.binding = a_position.buffer;
a_position_description.offset = a_position.offset;

const a_texCoord_description = new VertexInputAttributeDescription;
a_texCoord_description.location = 1;
a_texCoord_description.format = a_texCoord.format;
a_texCoord_description.binding = a_texCoord.buffer;
a_texCoord_description.offset = a_texCoord.offset;

const vertexInputState = new VertexInputState;
vertexInputState.attributes.add(a_position_description);
vertexInputState.attributes.add(a_texCoord_description);
vertexInputState.bindings.add(vertexInputBindingDescription);

const vertexes = new Float32Array([
    1, 1, 0, 1, 0,   // top right
    1, -1, 0, 1, 1,   // bottom right
    -1, -1, 0, 0, 1,   // bottom left
    -1, 1, 0, 0, 0    // top left 
]);
const vertexBufferInfo = new BufferInfo;
vertexBufferInfo.size = vertexes.byteLength;
vertexBufferInfo.usage = BufferUsageFlagBits.VERTEX;
vertexBufferInfo.mem_usage = MemoryUsage.CPU_TO_GPU;
const vertexBuffer = device.createBuffer(vertexBufferInfo);
vertexBuffer.update(vertexes.buffer, 0, vertexes.byteLength);

const indexes = new Uint16Array([0, 1, 3, 1, 2, 3])
const indexBufferInfo = new BufferInfo;
indexBufferInfo.size = indexes.byteLength;
indexBufferInfo.usage = BufferUsageFlagBits.INDEX;
indexBufferInfo.mem_usage = MemoryUsage.CPU_TO_GPU;
const indexBuffer = device.createBuffer(indexBufferInfo);
indexBuffer.update(indexes.buffer, 0, indexes.byteLength);

const inputAssemblerInfo = new InputAssemblerInfo;
inputAssemblerInfo.vertexAttributes.add(a_position);
inputAssemblerInfo.vertexAttributes.add(a_texCoord);
const vertexInput = new VertexInput;
vertexInput.buffers.add(vertexBuffer);
vertexInput.offsets.add(0);
const indexInput = new IndexInput;
indexInput.buffer = indexBuffer;
indexInput.type = IndexType.UINT16;
inputAssemblerInfo.vertexInput = vertexInput;
inputAssemblerInfo.indexInput = indexInput;
const inputAssembler = device.createInputAssembler(inputAssemblerInfo);

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