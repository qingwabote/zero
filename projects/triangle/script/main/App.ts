import { AttachmentDescription, BufferInfo, BufferUsageFlagBits, CullMode, Format, FormatInfos, FramebufferInfo, ImageLayout, InputAssemblerInfo, LOAD_OP, MemoryUsage, PassState, PipelineInfo, PipelineLayoutInfo, PrimitiveTopology, RasterizationState, RenderPassInfo, ShaderInfo, ShaderStageFlagBits, TextureInfo, TextureUsageBits, VertexAttribute, VertexInput, VertexInputAttributeDescription, VertexInputBindingDescription, VertexInputRate, VertexInputState } from "gfx";
import { device } from "./impl.js";

const vs = `
layout(location = 0) in vec4 a_position;

void main() {
    gl_Position = a_position;
}`

const fs = `
precision highp float;

layout(location = 0) out vec4 v_color;

void main() {
    v_color = vec4(1.0, 1.0, 1.0, 1.0);
}`

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

        const vertexInputAttributeDescription = new VertexInputAttributeDescription;
        vertexInputAttributeDescription.format = a_position.format;
        vertexInputAttributeDescription.location = 0;
        vertexInputAttributeDescription.offset = a_position.offset;
        vertexInputAttributeDescription.binding = a_position.buffer;

        const vertexInputBindingDescription = new VertexInputBindingDescription;
        vertexInputBindingDescription.inputRate = VertexInputRate.VERTEX;
        vertexInputBindingDescription.stride = FormatInfos[a_position.format].bytes;
        vertexInputBindingDescription.binding = 0;

        const vertexInputState = new VertexInputState;
        vertexInputState.attributes.add(vertexInputAttributeDescription);
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

        const pipelineLayoutInfo = new PipelineLayoutInfo;
        const pipelineLayout = device.createPipelineLayout();
        pipelineLayout.initialize(pipelineLayoutInfo);

        const pipelineInfo = new PipelineInfo;
        pipelineInfo.layout = pipelineLayout;
        pipelineInfo.passState = passState;
        pipelineInfo.vertexInputState = vertexInputState;
        pipelineInfo.renderPass = renderPass;

        const pipeline = device.createPipeline();
        pipeline.initialize(pipelineInfo);



        const positions = new Float32Array([
            0.0, 0.5, 0.0,
            -0.5, -0.5, 0.0,
            0.5, -0.5, 0.0
        ]);
        const position_bufferInfo = new BufferInfo;
        position_bufferInfo.size = positions.byteLength;
        position_bufferInfo.usage = BufferUsageFlagBits.VERTEX;
        position_bufferInfo.mem_usage = MemoryUsage.CPU_TO_GPU;
        const position_buffer = device.createBuffer();
        position_buffer.initialize(position_bufferInfo);
        position_buffer.update(positions.buffer, 0, positions.byteLength);

        const inputAssemblerInfo = new InputAssemblerInfo;
        inputAssemblerInfo.vertexAttributes.add(a_position);
        const vertexInput = new VertexInput;
        vertexInput.buffers.add(position_buffer);
        vertexInput.offsets.add(0);
        inputAssemblerInfo.vertexInput = vertexInput;
        const inputAssembler = device.createInputAssembler();
        inputAssembler.initialize(inputAssemblerInfo);

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
        commandBuffer.draw(3);

        commandBuffer.end();
    }
}