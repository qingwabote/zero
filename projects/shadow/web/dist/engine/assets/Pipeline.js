import { device } from "boot";
import { bundle } from "bundling";
import * as gfx from "gfx";
import { getSampler, render, shaderLib } from "../core/index.js";
import { rect } from "../core/math/rect.js";
import * as pipeline from "../pipeline/index.js";
import { Shader } from "./Shader.js";
import { Yml } from "./internal/Yml.js";
const phaseCreators = (function () {
    const rasterizationState = new gfx.RasterizationState;
    rasterizationState.cullMode = gfx.CullMode.NONE;
    const blendState = new gfx.BlendState;
    blendState.srcRGB = gfx.BlendFactor.ONE;
    blendState.dstRGB = gfx.BlendFactor.ONE_MINUS_SRC_ALPHA;
    blendState.srcAlpha = gfx.BlendFactor.ONE;
    blendState.dstAlpha = gfx.BlendFactor.ONE_MINUS_SRC_ALPHA;
    return {
        model: async function (info, context, visibility) {
            return new pipeline.ModelPhase(context, visibility, info.model, info.pass);
        },
        fxaa: async function (info, context, visibility) {
            const shaderAsset = await bundle.cache('shaders/fxaa', Shader);
            const shader = shaderLib.getShader(shaderAsset);
            const passState = new gfx.PassState;
            passState.shader = shader;
            passState.primitive = gfx.PrimitiveTopology.TRIANGLE_LIST;
            passState.rasterizationState = rasterizationState;
            passState.blendState = blendState;
            return new pipeline.PostPhase(context, passState, visibility);
        },
        outline: async function (info, context, visibility) {
            const shaderAsset = await bundle.cache('shaders/outline', Shader);
            const shader = shaderLib.getShader(shaderAsset);
            const passState = new gfx.PassState;
            passState.shader = shader;
            passState.primitive = gfx.PrimitiveTopology.TRIANGLE_LIST;
            passState.rasterizationState = rasterizationState;
            passState.blendState = blendState;
            return new pipeline.PostPhase(context, passState, visibility);
        },
        copy: async function (info, context, visibility) {
            const shaderAsset = await bundle.cache('shaders/copy', Shader);
            const shader = shaderLib.getShader(shaderAsset);
            const passState = new gfx.PassState;
            passState.shader = shader;
            passState.primitive = gfx.PrimitiveTopology.TRIANGLE_LIST;
            passState.rasterizationState = rasterizationState;
            passState.blendState = blendState;
            return new pipeline.PostPhase(context, passState, visibility);
        },
    };
})();
const UniformTypes = {
    Camera: pipeline.CameraUBO,
    Light: pipeline.LightUBO,
    Shadow: pipeline.ShadowUBO,
};
const ubo_cache = (function () {
    const ubos = {};
    return function (info) {
        let instance = ubos[info.type];
        if (!instance) {
            instance = new UniformTypes[info.type]();
            ubos[info.type] = instance;
        }
        return instance;
    };
})();
export class Pipeline extends Yml {
    constructor() {
        super(...arguments);
        this._textures = {};
    }
    get textures() {
        return this._textures;
    }
    async onParse(res) {
        this._info = res;
    }
    async instantiate(variables = {}) {
        if (this._info.textures) {
            for (const texture of this._info.textures) {
                this._textures[texture.name] = this.createTexture(texture);
            }
        }
        const uboMap = new Map;
        for (const ubo of this._info.ubos) {
            uboMap.set(ubo.name, ubo_cache(ubo));
        }
        const flows = [];
        for (const flow of this._info.flows) {
            const descriptorSetLayoutInfo = new gfx.DescriptorSetLayoutInfo;
            if (flow.bindings) {
                for (const bindingInfo of flow.bindings) {
                    const binding = new gfx.DescriptorSetLayoutBinding;
                    binding.descriptorCount = 1;
                    if ('ubo' in bindingInfo) {
                        const ubo = uboMap.get(bindingInfo.ubo);
                        if (!ubo) {
                            throw new Error(`undefined ubo: ${bindingInfo.ubo}`);
                        }
                        const definition = ubo.constructor.definition;
                        binding.descriptorType = definition.type;
                        binding.stageFlags = definition.stageFlags;
                        binding.binding = bindingInfo.binding;
                    }
                    else if ('texture' in bindingInfo) {
                        binding.descriptorType = gfx.DescriptorType.SAMPLER_TEXTURE;
                        binding.stageFlags = gfx.ShaderStageFlagBits.FRAGMENT;
                        binding.binding = bindingInfo.binding;
                    }
                    else {
                        throw new Error('ubo or texture?');
                    }
                    descriptorSetLayoutInfo.bindings.add(binding);
                }
            }
            const descriptorSetLayout = device.createDescriptorSetLayout(descriptorSetLayoutInfo);
            const context = new render.Context(descriptorSetLayout);
            const ubos = [];
            if (flow.bindings) {
                for (const binding of flow.bindings) {
                    if ('ubo' in binding) {
                        const ubo = uboMap.get(binding.ubo);
                        if (!ubo) {
                            throw new Error(`undefined ubo: ${binding.ubo}`);
                        }
                        context.descriptorSet.bindBuffer(binding.binding, ubo.buffer, ubo.range);
                        ubos.push(ubo);
                    }
                    else if ('texture' in binding) {
                        const filter = binding.filter ? gfx.Filter[binding.filter] : gfx.Filter.NEAREST;
                        context.descriptorSet.bindTexture(binding.binding, this._textures[binding.texture], getSampler(filter, filter));
                    }
                }
            }
            const stages = [];
            for (let i = 0; i < flow.stages.length; i++) {
                const stage = flow.stages[i];
                const phases = [];
                for (const phase of stage.phases) {
                    let visibility = 0xffffffff;
                    if (phase.visibility) {
                        visibility = Number(this.resolveVar(phase.visibility, variables));
                    }
                    const type = phase.type || 'model';
                    if (type in phaseCreators) {
                        phases.push(await phaseCreators[type](phase, context, visibility));
                    }
                    else {
                        throw new Error(`unsupported phase type: ${type}`);
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
                                throw new Error('not implemented');
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
                    framebufferInfo.renderPass = render.getRenderPass(framebufferInfo, clears);
                    framebuffer = device.createFramebuffer(framebufferInfo);
                    viewport = rect.create(0, 0, 1, 1);
                }
                stages.push(new render.Stage(phases, framebuffer, clears, viewport));
            }
            let loops;
            if (flow.loops) {
                loops = [];
                for (let flow_i = 0; flow_i < flow.loops.length; flow_i++) {
                    const loop = flow.loops[flow_i];
                    const setters = [];
                    if (loop.stages) {
                        for (let stage_i = 0; stage_i < loop.stages.length; stage_i++) {
                            const stage = loop.stages[stage_i];
                            if (stage.viewport) {
                                setters.push(function () {
                                    stages[stage_i].rect = stage.viewport;
                                });
                            }
                        }
                    }
                    loops.push(function () {
                        for (const setter of setters) {
                            setter();
                        }
                    });
                }
            }
            flows.push(new render.Flow(context, ubos, stages, loops));
        }
        return new render.Pipeline([...uboMap.values()], flows);
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
