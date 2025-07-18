import { device } from "boot";
import { bundle } from "bundling";
import { AttachmentDescription, BlendFactor, BlendState, CommandBuffer, DescriptorSetLayoutBinding, DescriptorSetLayoutInfo, DescriptorType, Filter, FramebufferInfo, ImageLayout, LOAD_OP, Pipeline, PipelineInfo, PipelineLayoutInfo, RasterizationState, RenderPassInfo, SamplerInfo, ShaderInfo, ShaderStageFlagBits } from "gfx";
import { FNT } from "../assets/FNT.js";
import { bmfont } from "../bmfont.js";
import { Component } from "../core/escapism/Component.js";
import { mat4 } from "../core/math/mat4.js";
import { vec2 } from "../core/math/vec2.js";
import { quad } from "../core/render/quad.js";
import { Zero } from "../core/Zero.js";

const { width, height } = device.swapchain.color.info;
const aspect = width / height;
const orthoSize = height / 2;
const x = orthoSize * aspect;
const y = orthoSize;
const PROJ = mat4.orthographic(mat4.create(), -x, x, -y, y, 1, 1000, device.capabilities.clipSpaceMinZ).join(',');

const TEXTURE_BINDING = 0;

const vs = `
const mat4 PROJ = mat4(${PROJ});

layout(location = 0) in vec4 a_position;
layout(location = 1) in vec2 a_texcoord;

layout(location = 0) out vec2 v_uv;

void main() {
    v_uv = a_texcoord;
    gl_Position = a_position * PROJ;
}`

const fs = `
precision highp float;

layout(location = 0) in vec2 v_uv;

layout(set = 0, binding = ${TEXTURE_BINDING}) uniform sampler2D albedoMap;

layout(location = 0) out vec4 v_color;

void main() {
    v_color = texture(albedoMap, v_uv);
}`

const fnt = await bundle.cache('fnt/zero', FNT);
const texture = fnt.texture;

const shaderInfo = new ShaderInfo;
shaderInfo.sources.add(vs);
shaderInfo.types.add(ShaderStageFlagBits.VERTEX);
shaderInfo.sources.add(fs);
shaderInfo.types.add(ShaderStageFlagBits.FRAGMENT);
const shader = device.createShader(shaderInfo);

const colorAttachmentDescription = new AttachmentDescription;
colorAttachmentDescription.format = device.swapchain.color.info.format;
colorAttachmentDescription.loadOp = LOAD_OP.LOAD;
colorAttachmentDescription.initialLayout = ImageLayout.PRESENT_SRC;
colorAttachmentDescription.finalLayout = ImageLayout.PRESENT_SRC;

const renderPassInfo = new RenderPassInfo
renderPassInfo.colors.add(colorAttachmentDescription);
renderPassInfo.samples = 1;

const renderPass = device.createRenderPass(renderPassInfo);

const descriptorSetLayoutBinding = new DescriptorSetLayoutBinding
descriptorSetLayoutBinding.descriptorType = DescriptorType.SAMPLER_TEXTURE;
descriptorSetLayoutBinding.stageFlags = ShaderStageFlagBits.FRAGMENT;
descriptorSetLayoutBinding.binding = TEXTURE_BINDING;
descriptorSetLayoutBinding.descriptorCount = 1;

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

const framebufferInfo = new FramebufferInfo;
framebufferInfo.colors.add(device.swapchain.color);
framebufferInfo.renderPass = renderPass;
framebufferInfo.width = width;
framebufferInfo.height = height;
const framebuffer = device.createFramebuffer(framebufferInfo);

const samplerInfo = new SamplerInfo;
samplerInfo.minFilter = Filter.LINEAR;
samplerInfo.magFilter = Filter.LINEAR;
const sampler = device.createSampler(samplerInfo)
const descriptorSet = device.createDescriptorSet(descriptorSetLayout);
descriptorSet.bindTexture(TEXTURE_BINDING, texture.impl, sampler)

const vec2_a = vec2.create();
const vec2_b = vec2.create();

export class Profiler implements Component {
    private readonly _vertexView = quad.createVertexBufferView();
    private readonly _ia = quad.createInputAssembler(this._vertexView.buffer)
    private readonly _pipeline: Pipeline;

    constructor() {
        const pipelineInfo = new PipelineInfo;
        pipelineInfo.inputState = this._ia.vertexInputState;
        pipelineInfo.layout = pipelineLayout;
        pipelineInfo.shader = shader;
        pipelineInfo.rasterizationState = new RasterizationState;
        pipelineInfo.blendState = blendState;
        pipelineInfo.renderPass = renderPass;

        this._pipeline = device.createPipeline(pipelineInfo);
    }

    render(cmd: CommandBuffer): void {
        const info = Zero.instance.profile;
        const text = `FPS      ${info.fps.toFixed(2)}
update   ${info.average(Zero.Phase.LATE_UPDATE).toFixed(2)}ms
scene    ${info.average(Zero.Phase.SCENE_UPDATE).toFixed(2)}ms
cull     ${info.average(Zero.Phase.SCENE_CULL).toFixed(2)}ms
batch    ${info.average(Zero.Phase.PIPELINE_BATCH).toFixed(2)}ms
sync     ${info.average(Zero.Phase.DEVICE_SYNC).toFixed(2)}ms
render   ${info.average(Zero.Phase.RENDER).toFixed(2)}ms
material ${Zero.instance.status.materials}
pipeline ${Zero.instance.status.pipelines}
draw     ${Zero.instance.status.draws}`

        const quads = bmfont.mesh(this._vertexView.reset(), vec2_a, vec2_b, fnt, text, 0.7, - width / 2 + 30, -height / 2 + 470);
        quad.indexBufferView.update(cmd);
        this._vertexView.update(cmd);

        cmd.beginRenderPass(renderPass, framebuffer, 0, 0, width, height);
        cmd.bindPipeline(this._pipeline);
        cmd.bindInputAssembler(this._ia);
        cmd.bindDescriptorSet(0, descriptorSet);
        cmd.drawIndexed(6 * quads, 0, 1);
        cmd.endRenderPass();
    }
}