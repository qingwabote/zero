import { AttachmentDescription, BufferInfo, BufferUsageFlagBits, CullMode, DescriptorSetLayoutBinding, DescriptorSetLayoutInfo, DescriptorType, Filter, Format, FormatInfos, FramebufferInfo, ImageLayout, InputAssemblerInfo, LOAD_OP, MemoryUsage, PassState, PipelineInfo, PipelineLayoutInfo, PrimitiveTopology, RasterizationState, RenderPassInfo, SampleCountFlagBits, SamplerInfo, ShaderInfo, ShaderStageFlagBits, SubmitInfo, TextureInfo, TextureUsageBits, VertexAttribute, VertexInput, VertexInputAttributeDescription, VertexInputBindingDescription, VertexInputRate, VertexInputState } from "gfx";
import { load } from "loader";
import { device } from "./impl.js";

const TEXTURE_BINDING = 8;

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
commandBuffer.initialize();

const bitmap = await load('../../assets/favicon.ico', 'bitmap')
const info = new TextureInfo;
info.samples = SampleCountFlagBits.SAMPLE_COUNT_1;
info.usage = TextureUsageBits.SAMPLED | TextureUsageBits.TRANSFER_DST;
info.width = bitmap.width;
info.height = bitmap.height;
const texture = device.createTexture();
texture.initialize(info);
commandBuffer.begin();
commandBuffer.copyImageBitmapToTexture(bitmap, texture);
commandBuffer.end();
const submitInfo = new SubmitInfo;
submitInfo.commandBuffer = commandBuffer;
device.queue.submit(submitInfo, fence);
device.queue.waitFence(fence);

export class App {
    constructor() {
        const shaderInfo = new ShaderInfo;
        shaderInfo.sources.add(vs);
        shaderInfo.types.add(ShaderStageFlagBits.VERTEX);
        shaderInfo.sources.add(fs);
        shaderInfo.types.add(ShaderStageFlagBits.FRAGMENT);
        const shader = device.createShader();
        shader.initialize(shaderInfo);

        const rasterizationState = new RasterizationState;
        rasterizationState.cullMode = CullMode.NONE;

        const passState = new PassState;
        passState.shader = shader;
        passState.primitive = PrimitiveTopology.TRIANGLE_LIST;
        passState.rasterizationState = rasterizationState;

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
        depthStencilAttachment.finalLayout = ImageLayout.DEPTH_STENCIL_ATTACHMENT_OPTIMAL;

        const renderPassInfo = new RenderPassInfo
        renderPassInfo.colorAttachments.add(colorAttachmentDescription);
        renderPassInfo.depthStencilAttachment = depthStencilAttachment;
        renderPassInfo.samples = 1;

        const renderPass = device.createRenderPass();
        renderPass.initialize(renderPassInfo);

        const descriptorSetLayoutBinding = new DescriptorSetLayoutBinding
        descriptorSetLayoutBinding.descriptorType = DescriptorType.SAMPLER_TEXTURE;
        descriptorSetLayoutBinding.stageFlags = ShaderStageFlagBits.FRAGMENT;
        descriptorSetLayoutBinding.binding = TEXTURE_BINDING;
        descriptorSetLayoutBinding.descriptorCount = 0;

        const descriptorSetLayoutInfo = new DescriptorSetLayoutInfo
        descriptorSetLayoutInfo.bindings.add(descriptorSetLayoutBinding);

        const descriptorSetLayout = device.createDescriptorSetLayout();
        descriptorSetLayout.initialize(descriptorSetLayoutInfo);

        const pipelineLayoutInfo = new PipelineLayoutInfo;
        pipelineLayoutInfo.layouts.add(descriptorSetLayout);

        const pipelineLayout = device.createPipelineLayout();
        pipelineLayout.initialize(pipelineLayoutInfo);

        const pipelineInfo = new PipelineInfo;
        pipelineInfo.layout = pipelineLayout;
        pipelineInfo.passState = passState;
        pipelineInfo.vertexInputState = vertexInputState;
        pipelineInfo.renderPass = renderPass;

        const pipeline = device.createPipeline();
        pipeline.initialize(pipelineInfo);



        const vertexes = new Float32Array([
            0.0, 0.5, 0.0,    /**uv */ 0.5, 0.0,
            - 0.5, -0.5, 0.0, /**uv */ 0.0, 1.0,
            0.5, -0.5, 0.0,   /**uv */ 1.0, 1.0
        ]);
        const bufferInfo = new BufferInfo;
        bufferInfo.size = vertexes.byteLength;
        bufferInfo.usage = BufferUsageFlagBits.VERTEX;
        bufferInfo.mem_usage = MemoryUsage.CPU_TO_GPU;
        const buffer = device.createBuffer();
        buffer.initialize(bufferInfo);
        buffer.update(vertexes.buffer, 0, vertexes.byteLength);

        const inputAssemblerInfo = new InputAssemblerInfo;
        inputAssemblerInfo.vertexAttributes.add(a_position);
        inputAssemblerInfo.vertexAttributes.add(a_texCoord);
        const vertexInput = new VertexInput;
        vertexInput.buffers.add(buffer);
        vertexInput.offsets.add(0);
        inputAssemblerInfo.vertexInput = vertexInput;
        const inputAssembler = device.createInputAssembler();
        inputAssembler.initialize(inputAssemblerInfo);

        const samplerInfo = new SamplerInfo;
        samplerInfo.magFilter = Filter.NEAREST;
        samplerInfo.magFilter = Filter.NEAREST;

        const sampler = device.createSampler()
        sampler.initialize(samplerInfo);

        const descriptorSet = device.createDescriptorSet();
        descriptorSet.initialize(descriptorSetLayout);
        descriptorSet.bindTexture(TEXTURE_BINDING, texture, sampler)

        const framebufferInfo = new FramebufferInfo;
        framebufferInfo.colorAttachments.add(device.swapchain.colorTexture);
        const depthStencilTextureInfo = new TextureInfo;
        depthStencilTextureInfo.samples = 1;
        depthStencilTextureInfo.usage = TextureUsageBits.DEPTH_STENCIL_ATTACHMENT;
        depthStencilTextureInfo.width = device.swapchain.width;
        depthStencilTextureInfo.height = device.swapchain.height;
        const depthStencilTexture = device.createTexture();
        depthStencilTexture.initialize(depthStencilTextureInfo);
        framebufferInfo.depthStencilAttachment = depthStencilTexture;
        framebufferInfo.renderPass = renderPass;
        framebufferInfo.width = device.swapchain.width;
        framebufferInfo.height = device.swapchain.height;
        const framebuffer = device.createFramebuffer();
        framebuffer.initialize(framebufferInfo);

        const commandBuffer = device.createCommandBuffer();
        commandBuffer.initialize();
        commandBuffer.begin()

        commandBuffer.beginRenderPass(renderPass, framebuffer, 0, 0, device.swapchain.width, device.swapchain.height);
        commandBuffer.bindPipeline(pipeline);
        commandBuffer.bindInputAssembler(inputAssembler);
        commandBuffer.bindDescriptorSet(pipelineLayout, 0, descriptorSet);
        commandBuffer.draw(3);

        commandBuffer.end();
    }
}