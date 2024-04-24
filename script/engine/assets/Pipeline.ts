import { device } from "boot";
import { bundle } from "bundling";
import * as gfx from "gfx";
import { Rect, rect } from "../core/math/rect.js";
import * as render from '../core/render/index.js';
import { Data } from "../core/render/pipeline/Data.js";
import { getSampler } from "../core/sc.js";
import { shaderLib } from "../core/shaderLib.js";
import * as pipeline from "../pipeline/index.js";
import { Shader } from "./Shader.js";
import { Yml } from "./internal/Yml.js";

interface PhaseBase {
    visibility?: string;
}

interface ModelPhase extends PhaseBase {
    type?: 'model';
    culling?: string;
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

const phaseCreators = (function () {
    const rasterizationState = new gfx.RasterizationState;
    rasterizationState.cullMode = gfx.CullMode.NONE;

    const blendState = new gfx.BlendState;
    blendState.srcRGB = gfx.BlendFactor.ONE;
    blendState.dstRGB = gfx.BlendFactor.ONE_MINUS_SRC_ALPHA;
    blendState.srcAlpha = gfx.BlendFactor.ONE;
    blendState.dstAlpha = gfx.BlendFactor.ONE_MINUS_SRC_ALPHA;

    const CullingInstances = {
        CSM: new pipeline.CSMCulling,
        View: new pipeline.ViewCulling
    }

    return {
        model: async function (info: ModelPhase, context: render.Context, visibility: number): Promise<render.Phase> {
            let culling = CullingInstances.View;
            if (info.culling) {
                culling = CullingInstances[info.culling as keyof typeof CullingInstances];
                if (!culling) {
                    throw new Error(`unknown culling type: ${info.culling}`);
                }
            }
            return new pipeline.ModelPhase(context, visibility, culling, info.model, info.pass);
        },
        fxaa: async function (info: FxaaPhase, context: render.Context, visibility: number): Promise<render.Phase> {
            const shaderAsset = await bundle.cache('shaders/fxaa', Shader);
            const shader = shaderLib.getShader(shaderAsset);

            const passState = new gfx.PassState;
            passState.shader = shader;
            passState.primitive = gfx.PrimitiveTopology.TRIANGLE_LIST;
            passState.rasterizationState = rasterizationState;
            passState.blendState = blendState;

            return new pipeline.PostPhase(context, passState, visibility);
        },
        outline: async function (info: OutlinePhase, context: render.Context, visibility: number): Promise<render.Phase> {
            const shaderAsset = await bundle.cache('shaders/outline', Shader);
            const shader = shaderLib.getShader(shaderAsset);

            const passState = new gfx.PassState;
            passState.shader = shader;
            passState.primitive = gfx.PrimitiveTopology.TRIANGLE_LIST;
            passState.rasterizationState = rasterizationState;
            passState.blendState = blendState;

            return new pipeline.PostPhase(context, passState, visibility);
        },
        copy: async function (info: CopyPhase, context: render.Context, visibility: number): Promise<render.Phase> {
            const shaderAsset = await bundle.cache('shaders/copy', Shader);
            const shader = shaderLib.getShader(shaderAsset);

            const passState = new gfx.PassState;
            passState.shader = shader;
            passState.primitive = gfx.PrimitiveTopology.TRIANGLE_LIST;
            passState.rasterizationState = rasterizationState;
            passState.blendState = blendState;

            return new pipeline.PostPhase(context, passState, visibility);
        },
    } as const;
})()

type Phase = ModelPhase | FxaaPhase;

type TextureUsage = keyof typeof gfx.TextureUsageFlagBits;

interface Texture {
    name: string;
    usage: TextureUsage[];
    swapchain: boolean;
    width: number;
    height: number;
}

interface Framebuffer {
    colors?: (Texture | string)[];
    resolves?: Texture[];
    depthStencil?: Texture | string;
    samples?: number;
}

type Clear = keyof typeof gfx.ClearFlagBits;

const UniformTypes: Record<string, new (data: Data, visibilities: number) => render.UBO> = {
    Camera: pipeline.CameraUBO,
    Light: pipeline.LightUBO,
    CSMI: pipeline.CSMIUBO,
    CSM: pipeline.CSMUBO
}

interface UBO {
    name: string;
    type: string;
}

interface Stage {
    phases?: Phase[];
    framebuffer?: Framebuffer;
    clears?: Clear[];
    viewport?: Rect;
}

interface Binding {
    binding: number
}

interface UBOBinding extends Binding {
    ubo: string
}

interface TextureBinding extends Binding {
    texture?: string
    filter?: string
}

interface FlowLoop {
    bindings?: (UBOBinding | TextureBinding)[];
    stages?: Stage[];
}

interface Flow extends FlowLoop {
    loops?: FlowLoop[]
}

interface Info {
    textures?: Texture[];
    ubos: UBO[];
    flows: Flow[];
}

export class Pipeline extends Yml {
    private _info!: Info;

    private _textures: Record<string, gfx.Texture> = {};
    public get textures(): Readonly<Record<string, gfx.Texture>> {
        return this._textures;
    }

    protected async onParse(res: Info): Promise<void> {
        this._info = res;
    }

    public async instantiate(variables?: Record<string, any>): Promise<render.Pipeline> {
        if (this._info.textures) {
            for (const texture of this._info.textures) {
                this._textures[texture.name] = this.createTexture(texture);
            }
        }

        const data = new Data;

        const uboVisibilities: Record<string, number> = {};
        for (const flow of this._info.flows) {
            const visibilities = this.flow_visibilities(flow, variables);
            for (const binding of flow.bindings!) {
                if ('ubo' in binding) {
                    uboVisibilities[binding.ubo] = (uboVisibilities[binding.ubo] || 0) | visibilities;
                }
            }
        }

        const uboMap: Map<string, render.UBO> = new Map;
        for (const ubo of this._info.ubos) {
            uboMap.set(ubo.name, new UniformTypes[ubo.type](data, uboVisibilities[ubo.name]));
        }

        const flows: render.Flow[] = [];
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
                        const definition = (ubo.constructor as typeof render.UBO).definition;
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
            const descriptorSetLayout = device.createDescriptorSetLayout(descriptorSetLayoutInfo);
            const context = new render.Context(descriptorSetLayout);
            const ubos: render.UBO[] = []
            if (flow.bindings) {
                for (const binding of flow.bindings) {
                    if ('ubo' in binding) {
                        const ubo = uboMap.get(binding.ubo);
                        if (!ubo) {
                            throw new Error(`undefined ubo: ${binding.ubo}`)
                        }
                        const definition = (ubo.constructor as typeof render.UBO).definition;
                        context.descriptorSet.bindBuffer(binding.binding, ubo.buffer, definition.size);
                        ubos.push(ubo);
                    } else if ('texture' in binding) {
                        const filter = binding.filter ? gfx.Filter[binding.filter as keyof typeof gfx.Filter] : gfx.Filter.NEAREST;
                        context.descriptorSet.bindTexture(binding.binding, this._textures[binding.texture], getSampler(filter, filter));
                    }
                }
            }

            const stages: render.Stage[] = [];
            for (let i = 0; i < flow.stages!.length; i++) {
                const stage = flow.stages![i];

                const phases: render.Phase[] = [];
                for (const phase of stage.phases!) {
                    let visibility = 0xffffffff;
                    if (phase.visibility) {
                        visibility = Number(this.resolveVar(phase.visibility, variables));
                    }
                    const type = phase.type || 'model';
                    if (type in phaseCreators) {
                        phases.push(await phaseCreators[type](phase as any, context, visibility))
                    } else {
                        throw new Error(`unsupported phase type: ${type}`);
                    }
                }
                let framebuffer: gfx.Framebuffer | undefined;
                let viewport: Rect | undefined;
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
                            framebufferInfo.colors.add(this.createTexture(texture, stage.framebuffer.samples));
                        }
                    }
                    if (stage.framebuffer.resolves) {
                        for (const texture of stage.framebuffer.resolves) {
                            if (texture.swapchain) {
                                framebufferInfo.resolves.add(device.swapchain.colorTexture);
                            } else {
                                throw new Error('not implemented')
                            }
                        }
                    }
                    if (stage.framebuffer.depthStencil) {
                        framebufferInfo.depthStencil = this.createTexture(stage.framebuffer.depthStencil, stage.framebuffer.samples);
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
                        ({ width, height } = framebufferInfo.depthStencil.info);
                    }
                    framebufferInfo.width = width;
                    framebufferInfo.height = height;

                    framebufferInfo.renderPass = render.getRenderPass(framebufferInfo, clears);
                    framebuffer = device.createFramebuffer(framebufferInfo);
                    viewport = rect.create(0, 0, 1, 1);
                }
                stages.push(new render.Stage(phases, this.stage_visibilities(stage, variables), framebuffer, clears, viewport));
            }
            let loops: Function[] | undefined;
            if (flow.loops) {
                loops = [];
                for (let loop_i = 0; loop_i < flow.loops.length; loop_i++) {
                    const loop = flow.loops[loop_i];
                    const setters: Function[] = [];
                    if (loop.stages) {
                        for (let stage_i = 0; stage_i < loop.stages.length; stage_i++) {
                            const stage = loop.stages[stage_i];
                            if (stage.viewport) {
                                setters.push(function () {
                                    stages[stage_i].rect = stage.viewport;
                                })
                            }
                        }
                    }
                    loops.push(function () {
                        data.flowLoopIndex = loop_i;
                        for (const setter of setters) {
                            setter();
                        }
                    })
                }
            }
            flows.push(new render.Flow(context, ubos, stages, this.flow_visibilities(flow, variables), loops));
        }

        return new render.Pipeline(data, [...uboMap.values()], flows);
    }

    private flow_visibilities(flow: Flow, variables?: Record<string, any>) {
        let res = 0;
        for (const stage of flow.stages!) {
            res |= this.stage_visibilities(stage, variables);
        }
        return res;
    }

    private stage_visibilities(stage: Stage, variables?: Record<string, any>) {
        let res = 0;
        for (const phase of stage.phases!) {
            if (phase.visibility) {
                res |= Number(this.resolveVar(phase.visibility, variables));
            }
        }
        return res;
    }

    private createTexture(texture: Texture | string, samples?: gfx.SampleCountFlagBits) {
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