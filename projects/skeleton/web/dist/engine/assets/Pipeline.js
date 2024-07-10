import { device } from "boot";
import { bundle } from "bundling";
import * as gfx from "gfx";
import { vec4 } from "../core/math/vec4.js";
import * as render from '../core/render/index.js';
import { Data } from "../core/render/pipeline/Data.js";
import { getSampler } from "../core/sc.js";
import { shaderLib } from "../core/shaderLib.js";
import * as pipeline from "../pipeline/index.js";
import { Shader } from "./Shader.js";
import { Yml } from "./internal/Yml.js";
const phaseFactory = (function () {
    const blendState = new gfx.BlendState;
    blendState.srcRGB = gfx.BlendFactor.ONE;
    blendState.dstRGB = gfx.BlendFactor.ONE_MINUS_SRC_ALPHA;
    blendState.srcAlpha = gfx.BlendFactor.ONE;
    blendState.dstAlpha = gfx.BlendFactor.ONE_MINUS_SRC_ALPHA;
    return {
        model: async function (info, context, visibility) {
            return new pipeline.ModelPhase(context, visibility, info.culling, info.batching, info.model, info.pass);
        },
        fxaa: async function (info, context, visibility) {
            const shaderAsset = await bundle.cache('shaders/fxaa', Shader);
            const shader = shaderLib.getShader(shaderAsset);
            return new pipeline.PostPhase(context, { shader, blendState }, visibility);
        },
        outline: async function (info, context, visibility) {
            const shaderAsset = await bundle.cache('shaders/outline', Shader);
            const shader = shaderLib.getShader(shaderAsset);
            return new pipeline.PostPhase(context, { shader, blendState }, visibility);
        },
        copy: async function (info, context, visibility) {
            const shaderAsset = await bundle.cache('shaders/copy', Shader);
            const shader = shaderLib.getShader(shaderAsset);
            return new pipeline.PostPhase(context, { shader, blendState }, visibility);
        },
    };
})();
const uboFactory = {
    Camera: function (data, visibilities, info) {
        return new pipeline.CameraUBO(data, visibilities);
    },
    Light: function (data, visibilities, info) {
        return new pipeline.LightUBO(data, visibilities);
    },
    CSMI: function (data, visibilities, info) {
        var _a;
        return new pipeline.CSMIUBO(data, visibilities, (_a = info === null || info === void 0 ? void 0 : info.num) !== null && _a !== void 0 ? _a : 4);
    },
    CSM: function (data, visibilities, info) {
        var _a;
        return new pipeline.CSMUBO(data, visibilities, (_a = info === null || info === void 0 ? void 0 : info.num) !== null && _a !== void 0 ? _a : 4);
    }
};
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
    async instantiate(variables) {
        if (this._info.textures) {
            for (const texture of this._info.textures) {
                this._textures[texture.name] = this.createTexture(texture);
            }
        }
        const data = new Data;
        const uboVisibilities = new Map;
        for (const flow of this._info.flows) {
            const visibilities = this.flow_visibilities(flow, variables);
            for (const binding of flow.bindings) {
                if ('ubo' in binding) {
                    uboVisibilities.set(binding.ubo, (uboVisibilities.get(binding.ubo) || 0) | visibilities);
                }
            }
        }
        const uboMap = new Map;
        if (this._info.ubos) {
            for (const ubo of this._info.ubos) {
                uboMap.set(ubo.type, uboFactory[ubo.type](data, uboVisibilities.get(ubo.type), ubo));
            }
        }
        for (const flow of this._info.flows) {
            for (const binding of flow.bindings) {
                if ('ubo' in binding) {
                    if (!uboMap.has(binding.ubo)) {
                        uboMap.set(binding.ubo, uboFactory[binding.ubo](data, uboVisibilities.get(binding.ubo)));
                    }
                }
            }
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
                    const type = phase.type || 'model';
                    if (type in phaseFactory) {
                        phases.push(await phaseFactory[type](phase, context, this.phase_visibilitiy(phase, variables)));
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
                    viewport = vec4.create(0, 0, 1, 1);
                }
                stages.push(new render.Stage(data, phases, this.stage_visibilities(stage, variables), framebuffer, clears, viewport));
            }
            let loops;
            if (flow.loops) {
                loops = [];
                for (let loop_i = 0; loop_i < flow.loops.length; loop_i++) {
                    const loop = flow.loops[loop_i];
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
            flows.push(new render.Flow(data, context, ubos, stages, this.flow_visibilities(flow, variables), loops));
        }
        return new render.Pipeline(data, [...uboMap.values()], flows);
    }
    flow_visibilities(flow, variables) {
        let res = 0;
        for (const stage of flow.stages) {
            res |= this.stage_visibilities(stage, variables);
        }
        return res;
    }
    stage_visibilities(stage, variables) {
        let res = 0;
        for (const phase of stage.phases) {
            res |= this.phase_visibilitiy(phase, variables);
        }
        return res;
    }
    phase_visibilitiy(phase, variables) {
        return phase.visibility ? Number(this.resolveVar(phase.visibility, variables)) : 0xffffffff;
    }
    createTexture(texture, samples) {
        var _a, _b;
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
        info.width = ((_a = texture.extent) === null || _a === void 0 ? void 0 : _a[0]) || device.swapchain.width;
        info.height = ((_b = texture.extent) === null || _b === void 0 ? void 0 : _b[1]) || device.swapchain.height;
        return device.createTexture(info);
    }
}
