// load boot first
import { device } from 'boot';
//
import { bundle } from 'bundling';
import { AttachmentDescription, BlendFactor, BlendState, BufferInfo, BufferUsageFlagBits, CullMode, DescriptorSetLayoutBinding, DescriptorSetLayoutInfo, DescriptorType, Filter, Format, FormatInfos, FramebufferInfo, ImageLayout, IndexInput, IndexType, InputAssemblerInfo, LOAD_OP, MemoryUsage, PassState, PipelineInfo, PipelineLayoutInfo, PrimitiveTopology, RasterizationState, RenderPassInfo, SamplerInfo, ShaderInfo, ShaderStageFlagBits, SubmitInfo, TextureInfo, TextureUsageFlagBits, VertexAttribute, VertexInput, VertexInputAttributeDescription, VertexInputBindingDescription, VertexInputRate, VertexInputState } from "gfx";

const TEXTURE_BINDING = 0;

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

layout(set = 0, binding = ${TEXTURE_BINDING}) uniform sampler2D albedoMap;

layout(location = 0) out vec4 v_color;

void main() {
    v_color = texture(albedoMap, v_uv);
}`

const fence = device.createFence();
const commandBuffer = device.createCommandBuffer();

const bitmap = await bundle.raw.once('favicon.ico', 'bitmap');

const info = new TextureInfo;
info.usage = TextureUsageFlagBits.SAMPLED | TextureUsageFlagBits.TRANSFER_DST;
info.width = bitmap.width;
info.height = bitmap.height;
const texture = device.createTexture(info);
commandBuffer.begin();
commandBuffer.copyImageBitmapToTexture(bitmap, texture);
commandBuffer.end();
const submitInfo = new SubmitInfo;
submitInfo.commandBuffer = commandBuffer;
device.queue.submit(submitInfo, fence);
device.queue.waitFence(fence);

const shaderInfo = new ShaderInfo;
shaderInfo.sources.add(vs);
shaderInfo.types.add(ShaderStageFlagBits.VERTEX);
shaderInfo.sources.add(fs);
shaderInfo.types.add(ShaderStageFlagBits.FRAGMENT);
const shader = device.createShader(shaderInfo);

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

const colorAttachmentDescription = new AttachmentDescription;
colorAttachmentDescription.loadOp = LOAD_OP.CLEAR;
colorAttachmentDescription.initialLayout = ImageLayout.UNDEFINED;
colorAttachmentDescription.finalLayout = ImageLayout.PRESENT_SRC;

const depthStencilAttachment = new AttachmentDescription();
depthStencilAttachment.loadOp = LOAD_OP.CLEAR;
depthStencilAttachment.initialLayout = ImageLayout.UNDEFINED;
depthStencilAttachment.finalLayout = ImageLayout.DEPTH_STENCIL;

const renderPassInfo = new RenderPassInfo
renderPassInfo.colors.add(colorAttachmentDescription);
renderPassInfo.depthStencil = depthStencilAttachment;
renderPassInfo.samples = 1;

const renderPass = device.createRenderPass(renderPassInfo);

const descriptorSetLayoutBinding = new DescriptorSetLayoutBinding
descriptorSetLayoutBinding.descriptorType = DescriptorType.SAMPLER_TEXTURE;
descriptorSetLayoutBinding.stageFlags = ShaderStageFlagBits.FRAGMENT;
descriptorSetLayoutBinding.binding = TEXTURE_BINDING;
descriptorSetLayoutBinding.descriptorCount = 0;

const descriptorSetLayoutInfo = new DescriptorSetLayoutInfo
descriptorSetLayoutInfo.bindings.add(descriptorSetLayoutBinding);

const descriptorSetLayout = device.createDescriptorSetLayout(descriptorSetLayoutInfo);

const pipelineLayoutInfo = new PipelineLayoutInfo;
pipelineLayoutInfo.layouts.add(descriptorSetLayout);

const pipelineLayout = device.createPipelineLayout(pipelineLayoutInfo);

const pipelineInfo = new PipelineInfo;
pipelineInfo.layout = pipelineLayout;
pipelineInfo.passState = passState;
pipelineInfo.vertexInputState = vertexInputState;
pipelineInfo.renderPass = renderPass;

const pipeline = device.createPipeline(pipelineInfo);

const { width, height } = device.swapchain;
const ratio = width / height;

const vertexes = new Float32Array([
    0.8, 0.8 * ratio, 0.0, 1.0, 0.0,   // top right
    0.8, -0.8 * ratio, 0.0, 1.0, 1.0,   // bottom right
    -0.8, -0.8 * ratio, 0.0, 0.0, 1.0,   // bottom left
    -0.8, 0.8 * ratio, 0.0, 0.0, 0.0    // top left 
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

const samplerInfo = new SamplerInfo;
samplerInfo.magFilter = Filter.LINEAR;
samplerInfo.magFilter = Filter.LINEAR;

const sampler = device.createSampler(samplerInfo)

const descriptorSet = device.createDescriptorSet(descriptorSetLayout);
descriptorSet.bindTexture(TEXTURE_BINDING, texture, sampler)

const framebufferInfo = new FramebufferInfo;
framebufferInfo.colors.add(device.swapchain.colorTexture);
const depthStencilTextureInfo = new TextureInfo;
depthStencilTextureInfo.usage = TextureUsageFlagBits.DEPTH_STENCIL;
depthStencilTextureInfo.width = device.swapchain.width;
depthStencilTextureInfo.height = device.swapchain.height;
const depthStencilTexture = device.createTexture(depthStencilTextureInfo);
framebufferInfo.depthStencil = depthStencilTexture;
framebufferInfo.renderPass = renderPass;
framebufferInfo.width = device.swapchain.width;
framebufferInfo.height = device.swapchain.height;
const framebuffer = device.createFramebuffer(framebufferInfo);

commandBuffer.begin()
commandBuffer.beginRenderPass(renderPass, framebuffer, 0, 0, device.swapchain.width, device.swapchain.height);
commandBuffer.bindPipeline(pipeline);
commandBuffer.bindInputAssembler(inputAssembler);
commandBuffer.bindDescriptorSet(pipelineLayout, 0, descriptorSet);
commandBuffer.drawIndexed(6, 0)

commandBuffer.end();