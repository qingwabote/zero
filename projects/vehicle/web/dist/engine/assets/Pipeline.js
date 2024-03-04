import { device } from "boot";
import { bundle } from "bundling";
import * as gfx from "gfx";
import { getSampler, render, shaderLib } from "../core/index.js";
import { rect } from "../core/math/rect.js";
import { Context } from "../core/render/Context.js";
import { getRenderPass } from "../core/render/pipeline/rpc.js";
import { ModelPhase, ShadowUniform } from "../pipeline/index.js";
import { PostPhase } from "../pipeline/phases/PostPhase.js";
import { CameraUniform } from "../pipeline/uniforms/CameraUniform.js";
import { LightUniform } from "../pipeline/uniforms/LightUniform.js";
import { Shader } from "./Shader.js";
import { Yml } from "./internal/Yml.js";
const post_rasterizationState = new gfx.RasterizationState;
post_rasterizationState.cullMode = gfx.CullMode.NONE;
const post_blendState = new gfx.BlendState;
post_blendState.srcRGB = gfx.BlendFactor.ONE;
post_blendState.dstRGB = gfx.BlendFactor.ONE_MINUS_SRC_ALPHA;
post_blendState.srcAlpha = gfx.BlendFactor.ONE;
post_blendState.dstAlpha = gfx.BlendFactor.ONE_MINUS_SRC_ALPHA;
const phaseCreators = {
    model: async function (info, context, visibility) {
        return new ModelPhase(context, visibility, info.model, info.pass);
    },
    fxaa: async function (info, context, visibility) {
        const shaderAsset = await bundle.cache('shaders/fxaa', Shader);
        const shader = shaderLib.getShader(shaderAsset);
        const passState = new gfx.PassState;
        passState.shader = shader;
        passState.primitive = gfx.PrimitiveTopology.TRIANGLE_LIST;
        passState.rasterizationState = post_rasterizationState;
        passState.blendState = post_blendState;
        return new PostPhase(context, passState, visibility);
    },
    outline: async function (info, context, visibility) {
        const shaderAsset = await bundle.cache('shaders/outline', Shader);
        const shader = shaderLib.getShader(shaderAsset);
        const passState = new gfx.PassState;
        passState.shader = shader;
        passState.primitive = gfx.PrimitiveTopology.TRIANGLE_LIST;
        passState.rasterizationState = post_rasterizationState;
        passState.blendState = post_blendState;
        return new PostPhase(context, passState, visibility);
    },
    copy: async function (info, context, visibility) {
        const shaderAsset = await bundle.cache('shaders/copy', Shader);
        const shader = shaderLib.getShader(shaderAsset);
        const passState = new gfx.PassState;
        passState.shader = shader;
        passState.primitive = gfx.PrimitiveTopology.TRIANGLE_LIST;
        passState.rasterizationState = post_rasterizationState;
        passState.blendState = post_blendState;
        return new PostPhase(context, passState, visibility);
    },
};
const UniformTypes = {
    camera: CameraUniform,
    light: LightUniform,
    shadow: ShadowUniform,
    samplerTexture: {
        definition: {
            type: gfx.DescriptorType.SAMPLER_TEXTURE,
            stageFlags: gfx.ShaderStageFlagBits.FRAGMENT
        }
    }
};
const uniformInstances = new Map;
export class Pipeline extends Yml {
    constructor() {
        super(...arguments);
        this._textures = {};
    }
    get textures() {
        return this._textures;
    }
    async onParse(res) {
        this._resource = res;
    }
    async instantiate(variables = {}) {
        if (this._resource.textures) {
            for (const texture of this._resource.textures) {
                this._textures[texture.name] = this.createTexture(texture);
            }
        }
        const flows = [];
        for (const flow of this._resource.flows) {
            const descriptorSetLayoutInfo = new gfx.DescriptorSetLayoutInfo;
            if (flow.uniforms) {
                for (const uniform of flow.uniforms) {
                    if (uniform.type in UniformTypes) {
                        const definition = UniformTypes[uniform.type].definition;
                        const binding = new gfx.DescriptorSetLayoutBinding;
                        binding.descriptorType = definition.type;
                        binding.stageFlags = definition.stageFlags;
                        binding.binding = uniform.binding;
                        binding.descriptorCount = 1;
                        descriptorSetLayoutInfo.bindings.add(binding);
                    }
                    else {
                        throw `unsupported uniform: ${uniform}`;
                    }
                }
            }
            const descriptorSetLayout = device.createDescriptorSetLayout(descriptorSetLayoutInfo);
            const context = new Context(descriptorSetLayout);
            const uniforms = [];
            if (flow.uniforms) {
                for (const uniform of flow.uniforms) {
                    if (uniform.type == 'samplerTexture') {
                        const filter = uniform.filter ? gfx.Filter[uniform.filter] : gfx.Filter.NEAREST;
                        context.descriptorSet.bindTexture(uniform.binding, this._textures[uniform.texture], getSampler(filter, filter));
                        continue;
                    }
                    let instance = uniformInstances.get(UniformTypes[uniform.type]);
                    if (!instance) {
                        instance = new UniformTypes[uniform.type]();
                        uniformInstances.set(UniformTypes[uniform.type], instance);
                    }
                    context.descriptorSet.bindBuffer(uniform.binding, instance.buffer, instance.range);
                    uniforms.push(instance);
                }
            }
            const stages = [];
            for (let i = 0; i < flow.stages.length; i++) {
                const stage = flow.stages[i];
                const phases = [];
                for (const phase of stage.phases) {
                    let visibility;
                    if (phase.visibility) {
                        visibility = Number(this.resolveVar(phase.visibility, variables));
                    }
                    const type = phase.type || 'model';
                    if (type in phaseCreators) {
                        phases.push(await phaseCreators[type](phase, context, visibility));
                    }
                    else {
                        throw `unsupported phase type: ${type}`;
                    }
                }
                let framebuffer;
                let viewport;
                let clears;
                if (stage.clears) {
                    clears = gfx.ClearFlagBits.NONE;
                    for (const clear of stage.clears) {
                        clears |= gfx.ClearFlagBits[clear];
                    }
                }
                if (stage.framebuffer) {
                    const framebufferInfo = new gfx.FramebufferInfo;
                    if (stage.framebuffer.colors) {
                        for (const texture of stage.framebuffer.colors) {
                            framebufferInfo.colors.add(this.createTexture(texture, stage.framebuffer.samples));
                        }
                    }
                    if (stage.framebuffer.resolves) {
                        for (const texture of stage.framebuffer.resolves) {
                            if (texture.swapchain) {
                                framebufferInfo.resolves.add(device.swapchain.colorTexture);
                            }
                            else {
                                throw 'not implemented';
                            }
                        }
                    }
                    if (stage.framebuffer.depthStencil) {
                        framebufferInfo.depthStencil = this.createTexture(stage.framebuffer.depthStencil, stage.framebuffer.samples);
                    }
                    let width;
                    let height;
                    for (let i = 0; i < framebufferInfo.colors.size(); i++) {
                        if (width && height) {
                            break;
                        }
                        const texture = framebufferInfo.colors.get(i);
                        ({ width, height } = texture.info);
                    }
                    if (!width || !height) {
                        ({ width, height } = framebufferInfo.depthStencil.info);
                    }
                    framebufferInfo.width = width;
                    framebufferInfo.height = height;
                    framebufferInfo.renderPass = getRenderPass(framebufferInfo, clears);
                    framebuffer = device.createFramebuffer(framebufferInfo);
                    if (stage.viewport) {
                        viewport = rect.create(stage.viewport.x, stage.viewport.y, stage.viewport.width, stage.viewport.height);
                    }
                    else {
                        viewport = rect.create(0, 0, width, height);
                    }
                }
                stages.push(new render.Stage(context, phases, framebuffer, clears, viewport));
            }
            flows.push(new render.Flow(context, uniforms, stages));
        }
        return new render.Pipeline(flows);
    }
    createTexture(texture, samples) {
        if (typeof texture == 'string') {
            return this._textures[texture];
        }
        const info = new gfx.TextureInfo;
        for (const usage of texture.usage) {
            info.usage |= gfx.TextureUsageFlagBits[usage];
        }
        if (samples) {
            info.samples = samples;
        }
        info.width = texture.width || device.swapchain.width;
        info.height = texture.height || device.swapchain.height;
        return device.createTexture(info);
    }
}
