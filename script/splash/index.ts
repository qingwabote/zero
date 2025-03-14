// load boot first
import { device } from 'boot';
//
import { bundle } from 'bundling';
import { AttachmentDescription, BlendFactor, BlendState, BufferInfo, BufferUsageFlagBits, DescriptorSetLayoutBinding, DescriptorSetLayoutInfo, DescriptorType, Filter, Format, FormatInfos, FramebufferInfo, ImageLayout, IndexInput, IndexType, InputAssembler, LOAD_OP, PipelineInfo, PipelineLayoutInfo, PrimitiveTopology, RasterizationState, RenderPassInfo, SamplerInfo, ShaderInfo, ShaderStageFlagBits, SubmitInfo, TextureInfo, TextureUsageFlagBits, VertexAttribute } from "gfx";

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
info.format = Format.RGBA8_UNORM;
info.width = bitmap.width;
info.height = bitmap.height;
const texture = device.createTexture(info);
commandBuffer.begin();
commandBuffer.copyImageBitmapToTexture(bitmap, texture);
commandBuffer.end();
const submitInfo = new SubmitInfo;
submitInfo.commandBuffer = commandBuffer;
device.queue.submit(submitInfo, fence);
device.waitForFence(fence);

const shaderInfo = new ShaderInfo;
shaderInfo.sources.add(vs);
shaderInfo.types.add(ShaderStageFlagBits.VERTEX);
shaderInfo.sources.add(fs);
shaderInfo.types.add(ShaderStageFlagBits.FRAGMENT);
const shader = device.createShader(shaderInfo);

const a_position = new VertexAttribute;
a_position.format = Format.RGB32_SFLOAT;
a_position.offset = 0;
a_position.buffer = 0;
a_position.location = 0;

const a_texCoord = new VertexAttribute;
a_texCoord.format = Format.RG32_SFLOAT;
a_texCoord.offset = FormatInfos[a_position.format].bytes;
a_texCoord.buffer = 0;
a_texCoord.location = 1;

const { width, height } = device.swapchain.color.info;
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
const vertexBuffer = device.createBuffer(vertexBufferInfo);
vertexBuffer.upload(vertexes, 0, 0, 0);

const indexes = new Uint16Array([0, 1, 3, 1, 2, 3])
const indexBufferInfo = new BufferInfo;
indexBufferInfo.size = indexes.byteLength;
indexBufferInfo.usage = BufferUsageFlagBits.INDEX;
const indexBuffer = device.createBuffer(indexBufferInfo);
indexBuffer.upload(indexes, 0, 0, 0);

const inputAssembler = new InputAssembler;
inputAssembler.vertexInputState.primitive = PrimitiveTopology.TRIANGLE_LIST;
inputAssembler.vertexInputState.attributes.add(a_position);
inputAssembler.vertexInputState.attributes.add(a_texCoord);
inputAssembler.vertexInput.buffers.add(vertexBuffer);
inputAssembler.vertexInput.offsets.add(0);
const indexInput = new IndexInput;
indexInput.buffer = indexBuffer;
indexInput.type = IndexType.UINT16;
inputAssembler.indexInput = indexInput;

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

const blendState = new BlendState;
blendState.srcRGB = BlendFactor.SRC_ALPHA;
blendState.dstRGB = BlendFactor.ONE_MINUS_SRC_ALPHA;
blendState.srcAlpha = BlendFactor.ONE;
blendState.dstAlpha = BlendFactor.ONE_MINUS_SRC_ALPHA

const pipelineInfo = new PipelineInfo;
pipelineInfo.inputState = inputAssembler.vertexInputState;
pipelineInfo.layout = pipelineLayout;
pipelineInfo.shader = shader;
pipelineInfo.rasterizationState = new RasterizationState;
pipelineInfo.blendState = blendState;
pipelineInfo.renderPass = renderPass;

const pipeline = device.createPipeline(pipelineInfo);

const framebufferInfo = new FramebufferInfo;
framebufferInfo.colors.add(device.swapchain.color);
const depthStencilTextureInfo = new TextureInfo;
depthStencilTextureInfo.usage = TextureUsageFlagBits.DEPTH_STENCIL;
depthStencilTextureInfo.format = Format.D32_SFLOAT;
depthStencilTextureInfo.width = width;
depthStencilTextureInfo.height = height;
const depthStencilTexture = device.createTexture(depthStencilTextureInfo);
framebufferInfo.depthStencil = depthStencilTexture;
framebufferInfo.renderPass = renderPass;
framebufferInfo.width = width;
framebufferInfo.height = height;
const framebuffer = device.createFramebuffer(framebufferInfo);

const samplerInfo = new SamplerInfo;
samplerInfo.magFilter = Filter.LINEAR;
samplerInfo.magFilter = Filter.LINEAR;
const sampler = device.createSampler(samplerInfo)
const descriptorSet = device.createDescriptorSet(descriptorSetLayout);
descriptorSet.bindTexture(TEXTURE_BINDING, texture, sampler)

commandBuffer.begin()
commandBuffer.beginRenderPass(renderPass, framebuffer, 0, 0, width, height);
commandBuffer.bindPipeline(pipeline);
commandBuffer.bindInputAssembler(inputAssembler);
commandBuffer.bindDescriptorSet(0, descriptorSet);
commandBuffer.drawIndexed(6, 0, 1)

commandBuffer.end();