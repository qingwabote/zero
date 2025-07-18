import { device } from "boot";
import { bundle } from "bundling";
import * as gfx from "gfx";
import { Vec2 } from "../core/math/vec2.js";
import { Vec4, vec4 } from "../core/math/vec4.js";
import * as render from "../core/render/index.js";
import { Data } from "../core/render/pipeline/Data.js";
import { getSampler } from "../core/sc.js";
import { shaderLib } from "../core/shaderLib.js";
import * as pipeline from "../pipeline/index.js";
import { Pass } from "../scene/Pass.js";
import { Shader } from "./Shader.js";
import { Yml } from "./internal/Yml.js";

interface PhaseBase {
    visibility?: string;
}
interface ModelPhase extends PhaseBase {
    type?: 'model';
    frustum?: pipeline.ModelPhase.Frustum;
    model?: string;
    pass?: string;
}
interface FxaaPhase extends PhaseBase {
    type: 'fxaa';
}
interface OutlinePhase extends PhaseBase {
    type: 'outline';
}
interface CopyPhase extends PhaseBase {
    type: 'copy';
}
interface StrokePhase extends PhaseBase {
    type: 'stroke'
}

const phaseFactory = (function () {
    const blendState = new gfx.BlendState;
    blendState.srcRGB = gfx.BlendFactor.ONE;
    blendState.dstRGB = gfx.BlendFactor.ONE_MINUS_SRC_ALPHA;
    blendState.srcAlpha = gfx.BlendFactor.ONE;
    blendState.dstAlpha = gfx.BlendFactor.ONE_MINUS_SRC_ALPHA;

    return {
        model: async function (info: ModelPhase, visibility: number, flowLoopIndex: number, data: Data): Promise<pipeline.Phase> {
            return new pipeline.ModelPhase(visibility, flowLoopIndex, data, info.frustum, info.model, info.pass);
        },
        fxaa: async function (info: FxaaPhase, visibility: number): Promise<pipeline.Phase> {
            const shaderAsset = await bundle.cache('shaders/fxaa', Shader);
            const shader = shaderLib.getShader(shaderAsset);
            return new pipeline.PostPhase(new Pass({ shader, blendState }), visibility);
        },
        outline: async function (info: OutlinePhase, visibility: number): Promise<pipeline.Phase> {
            const shaderAsset = await bundle.cache('shaders/outline', Shader);
            const shader = shaderLib.getShader(shaderAsset);
            return new pipeline.PostPhase(new Pass({ shader, blendState }), visibility);
        },
        copy: async function (info: CopyPhase, visibility: number): Promise<pipeline.Phase> {
            const shaderAsset = await bundle.cache('shaders/copy', Shader);
            const shader = shaderLib.getShader(shaderAsset);
            return new pipeline.PostPhase(new Pass({ shader, blendState }), visibility);
        },
        stroke: async function (info: StrokePhase, visibility: number): Promise<pipeline.Phase> {
            return new pipeline.StrokePhase(visibility);
        },
    } as const;
})()

type Phase = ModelPhase | FxaaPhase;

type TextureUsage = keyof typeof gfx.TextureUsageFlagBits;

interface Texture {
    name: string;
    usage: TextureUsage[];
    swapchain: boolean;
    extent?: Vec2;
}

function createTexture(texture: Texture, samples?: gfx.SampleCountFlagBits) {
    let usage = gfx.TextureUsageFlagBits.NONE;
    for (const u of texture.usage) {
        usage |= gfx.TextureUsageFlagBits[u];
    }
    let format = gfx.Format.UNDEFINED;
    if (usage & gfx.TextureUsageFlagBits.COLOR) {
        // The Vulkan spec states: 
        // If externalFormatResolve is not enabled, each element of pResolveAttachments must have the same VkFormat as its corresponding color attachment
        // (https://vulkan.lunarg.com/doc/view/1.3.290.0/windows/1.3-extensions/vkspec.html#VUID-VkSubpassDescription2-externalFormatResolve-09339)
        format = device.swapchain.color.info.format;
    } else if (usage & gfx.TextureUsageFlagBits.DEPTH_STENCIL) {
        format = gfx.Format.D32_SFLOAT;
    } else {
        throw new Error(`unsupported texture usage: ${usage}`);
    }

    const info = new gfx.TextureInfo;
    info.usage = usage;
    info.format = format;
    if (samples) {
        info.samples = samples;
    }
    info.width = texture.extent?.[0] || device.swapchain.color.info.width;
    info.height = texture.extent?.[1] || device.swapchain.color.info.height;
    return device.createTexture(info);
}

interface Framebuffer {
    colors?: (Texture | string)[];
    resolves?: Texture[];
    depthStencil?: Texture | string;
    samples?: number;
}

type Clear = keyof typeof gfx.ClearFlagBits;

interface CameraUBO {
    type: 'Camera';
}
interface LightUBO {
    type: 'Light';
}
interface CSMIUBO {
    type: 'CSMI';
    num: number;
}
interface CSMUBO {
    type: 'CSM';
    num: number;
}

const uboFactory = {
    Camera: function (data: Data, visibilities: number, info?: CameraUBO) {
        return new pipeline.CameraUBO(data, visibilities);
    },
    Light: function (data: Data, visibilities: number, info?: LightUBO) {
        return new pipeline.LightUBO(data, visibilities);
    },
    CSMI: function (data: Data, visibilities: number, info?: CSMIUBO) {
        return new pipeline.CSMIUBO(data, visibilities, info?.num ?? 4);
    },
    CSM: function (data: Data, visibilities: number, info?: CSMUBO) {
        return new pipeline.CSMUBO(data, visibilities, info?.num ?? 4);
    }
}

interface Stage {
    phases?: Phase[];
    framebuffer?: Framebuffer;
    clears?: Clear[];
    viewport?: Vec4;
}

interface Binding {
    binding: number
}

interface UBOBinding extends Binding {
    ubo: keyof typeof uboFactory
}

interface TextureBinding extends Binding {
    texture?: string
    filter?: string
}

interface _Flow {
    stages?: Stage[];
}

interface Flow extends _Flow {
    bindings?: (UBOBinding | TextureBinding)[];
    loops?: _Flow[]
}

type UBO = CameraUBO | LightUBO | CSMIUBO | CSMUBO

interface Info {
    ubos?: UBO[];
    textures?: Texture[];
    flows: Flow[];
}

export class Pipeline extends Yml {
    private _info!: Info;

    protected async onParse(res: Info): Promise<void> {
        this._info = res;
    }

    public async instantiate(variables?: Record<string, any>): Promise<render.Pipeline> {
        const textures: Record<string, gfx.Texture> = {};
        if (this._info.textures) {
            for (const texture of this._info.textures) {
                textures[texture.name] = createTexture(texture);
            }
        }

        const data = new Data;

        const uboVisibilities: Map<keyof typeof uboFactory, number> = new Map;
        for (const flow of this._info.flows) {
            const visibilities = this.flow_visibilities(flow, variables);
            for (const binding of flow.bindings!) {
                if ('ubo' in binding) {
                    uboVisibilities.set(binding.ubo, (uboVisibilities.get(binding.ubo) || 0) | visibilities);
                }
            }
        }

        const uboMap: Map<keyof typeof uboFactory, pipeline.UBO> = new Map;
        if (this._info.ubos) {
            for (const ubo of this._info.ubos) {
                uboMap.set(ubo.type, uboFactory[ubo.type](data, uboVisibilities.get(ubo.type)!, ubo as any));
            }
        }
        for (const flow of this._info.flows) {
            for (const binding of flow.bindings!) {
                if ('ubo' in binding) {
                    if (!uboMap.has(binding.ubo)) {
                        uboMap.set(binding.ubo, uboFactory[binding.ubo](data, uboVisibilities.get(binding.ubo)!))
                    }
                }
            }
        }

        const flows: pipeline.Flow[] = [];
        for (const flow of this._info.flows) {
            const descriptorSetLayoutInfo = new gfx.DescriptorSetLayoutInfo;
            if (flow.bindings) {
                for (const bindingInfo of flow.bindings) {
                    const binding = new gfx.DescriptorSetLayoutBinding;
                    binding.descriptorCount = 1;
                    if ('ubo' in bindingInfo) {
                        const ubo = uboMap.get(bindingInfo.ubo);
                        if (!ubo) {
                            throw new Error(`undefined ubo: ${bindingInfo.ubo}`)
                        }
                        const definition = (ubo.constructor as typeof pipeline.UBO).definition;
                        binding.descriptorType = definition.type;
                        binding.stageFlags = definition.stageFlags;
                        binding.binding = bindingInfo.binding;
                    } else if ('texture' in bindingInfo) {
                        binding.descriptorType = gfx.DescriptorType.SAMPLER_TEXTURE;
                        binding.stageFlags = gfx.ShaderStageFlagBits.FRAGMENT;
                        binding.binding = bindingInfo.binding;
                    } else {
                        throw new Error('ubo or texture?')
                    }
                    descriptorSetLayoutInfo.bindings.add(binding);
                }
            }
            const context = new pipeline.FlowContext(device.createDescriptorSetLayout(descriptorSetLayoutInfo));
            const ubos: pipeline.UBO[] = []
            if (flow.bindings) {
                for (const binding of flow.bindings) {
                    if ('ubo' in binding) {
                        const ubo = uboMap.get(binding.ubo);
                        if (!ubo) {
                            throw new Error(`undefined ubo: ${binding.ubo}`)
                        }
                        context.descriptorSet.bindBuffer(binding.binding, ubo.buffer, ubo.range);
                        ubos.push(ubo);
                    } else if ('texture' in binding) {
                        const filter = binding.filter ? gfx.Filter[binding.filter as keyof typeof gfx.Filter] : gfx.Filter.NEAREST;
                        context.descriptorSet.bindTexture(binding.binding, textures[binding.texture], getSampler(filter, filter));
                    }
                }
            }

            const count = flow.loops?.length || 1;
            for (let flowLoopIndex = 0; flowLoopIndex < count; flowLoopIndex++) {
                const _flow = flow.loops?.[flowLoopIndex];
                const stages: pipeline.Stage[] = [];
                for (let i = 0; i < flow.stages!.length; i++) {
                    const stage = flow.stages![i];

                    const phases: pipeline.Phase[] = [];
                    for (const phase of stage.phases!) {
                        const type = phase.type || 'model';
                        if (type in phaseFactory) {
                            phases.push(await phaseFactory[type](phase as any, this.phase_visibilitiy(phase, variables), flowLoopIndex, data))
                        } else {
                            throw new Error(`unsupported phase type: ${type}`);
                        }
                    }
                    let framebuffer: gfx.Framebuffer | undefined;
                    let viewport = _flow?.stages?.[i].viewport;
                    let clears: gfx.ClearFlagBits | undefined;
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
                                framebufferInfo.colors.add(typeof texture == 'string' ? textures[texture] : createTexture(texture, stage.framebuffer.samples));
                            }
                        }
                        if (stage.framebuffer.resolves) {
                            for (const texture of stage.framebuffer.resolves) {
                                if (texture.swapchain) {
                                    framebufferInfo.resolves.add(device.swapchain.color);
                                } else {
                                    throw new Error('not implemented')
                                }
                            }
                        }
                        if (stage.framebuffer.depthStencil) {
                            framebufferInfo.depthStencil = typeof stage.framebuffer.depthStencil == 'string' ? textures[stage.framebuffer.depthStencil] : createTexture(stage.framebuffer.depthStencil, stage.framebuffer.samples);
                        }

                        let width: number | undefined;
                        let height: number | undefined;
                        for (let i = 0; i < framebufferInfo.colors.size(); i++) {
                            if (width && height) {
                                break;
                            }
                            const texture = framebufferInfo.colors.get(i);
                            ({ width, height } = texture.info);
                        }
                        if (!width || !height) {
                            ({ width, height } = framebufferInfo.depthStencil!.info);
                        }
                        framebufferInfo.width = width;
                        framebufferInfo.height = height;

                        framebufferInfo.renderPass = pipeline.getRenderPass(framebufferInfo, clears);
                        framebuffer = device.createFramebuffer(framebufferInfo);
                        viewport = viewport || vec4.create(0, 0, 1, 1);
                    }
                    stages.push(new pipeline.Stage(context, phases, framebuffer, clears, viewport));
                }
                flows.push(new pipeline.Flow(context, ubos, stages, this.flow_visibilities(flow, variables), flowLoopIndex));
            }
        }

        return new render.Pipeline(data, textures, [...uboMap.values()], flows);
    }

    private flow_visibilities(flow: Flow, variables?: Record<string, any>): number {
        let res = 0;
        for (const stage of flow.stages!) {
            res |= this.stage_visibilities(stage, variables);
        }
        return res;
    }

    private stage_visibilities(stage: Stage, variables?: Record<string, any>): number {
        let res = 0;
        for (const phase of stage.phases!) {
            res |= this.phase_visibilitiy(phase, variables);
        }
        return res;
    }

    private phase_visibilitiy(phase: Phase, variables?: Record<string, any>): number {
        return phase.visibility ? Number(this.resolveVar(phase.visibility, variables)) : 0xffffffff;
    }
}