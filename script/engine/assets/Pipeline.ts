import { device } from "boot";
import { bundle } from "bundling";
import * as gfx from "gfx";
import { Vec2 } from "../core/math/vec2.js";
import { Vec4, vec4 } from "../core/math/vec4.js";
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
    batching?: boolean;
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

const phaseFactory = (function () {
    const blendState = new gfx.BlendState;
    blendState.srcRGB = gfx.BlendFactor.ONE;
    blendState.dstRGB = gfx.BlendFactor.ONE_MINUS_SRC_ALPHA;
    blendState.srcAlpha = gfx.BlendFactor.ONE;
    blendState.dstAlpha = gfx.BlendFactor.ONE_MINUS_SRC_ALPHA;

    const cullers = {
        CSM: new pipeline.CSMCuller,
        View: new pipeline.ViewCuller
    }

    return {
        model: async function (info: ModelPhase, context: render.Context, visibility: number): Promise<render.Phase> {
            let culler = cullers.View;
            if (info.culling) {
                culler = cullers[info.culling as keyof typeof cullers];
                if (!culler) {
                    throw new Error(`unknown culling type: ${info.culling}`);
                }
            }
            return new pipeline.ModelPhase(context, visibility, culler, info.batching, info.model, info.pass);
        },
        fxaa: async function (info: FxaaPhase, context: render.Context, visibility: number): Promise<render.Phase> {
            const shaderAsset = await bundle.cache('shaders/fxaa', Shader);
            const shader = shaderLib.getShader(shaderAsset);

            const passState = new gfx.PassState;
            passState.shader = shader;
            passState.primitive = gfx.PrimitiveTopology.TRIANGLE_LIST;
            passState.blendState = blendState;

            return new pipeline.PostPhase(context, passState, visibility);
        },
        outline: async function (info: OutlinePhase, context: render.Context, visibility: number): Promise<render.Phase> {
            const shaderAsset = await bundle.cache('shaders/outline', Shader);
            const shader = shaderLib.getShader(shaderAsset);

            const passState = new gfx.PassState;
            passState.shader = shader;
            passState.primitive = gfx.PrimitiveTopology.TRIANGLE_LIST;
            passState.blendState = blendState;

            return new pipeline.PostPhase(context, passState, visibility);
        },
        copy: async function (info: CopyPhase, context: render.Context, visibility: number): Promise<render.Phase> {
            const shaderAsset = await bundle.cache('shaders/copy', Shader);
            const shader = shaderLib.getShader(shaderAsset);

            const passState = new gfx.PassState;
            passState.shader = shader;
            passState.primitive = gfx.PrimitiveTopology.TRIANGLE_LIST;
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
    extent?: Vec2;
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

interface FlowLoop {
    bindings?: (UBOBinding | TextureBinding)[];
    stages?: Stage[];
}

interface Flow extends FlowLoop {
    loops?: FlowLoop[]
}

type UBO = CameraUBO | LightUBO | CSMIUBO | CSMUBO

interface Info {
    ubos?: UBO[];
    textures?: Texture[];
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

        const uboVisibilities: Map<keyof typeof uboFactory, number> = new Map;
        for (const flow of this._info.flows) {
            const visibilities = this.flow_visibilities(flow, variables);
            for (const binding of flow.bindings!) {
                if ('ubo' in binding) {
                    uboVisibilities.set(binding.ubo, (uboVisibilities.get(binding.ubo) || 0) | visibilities);
                }
            }
        }

        const uboMap: Map<keyof typeof uboFactory, render.UBO> = new Map;
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
                        context.descriptorSet.bindBuffer(binding.binding, ubo.buffer, ubo.range);
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
                    const type = phase.type || 'model';
                    if (type in phaseFactory) {
                        phases.push(await phaseFactory[type](phase as any, context, this.phase_visibilitiy(phase, variables)))
                    } else {
                        throw new Error(`unsupported phase type: ${type}`);
                    }
                }
                let framebuffer: gfx.Framebuffer | undefined;
                let viewport: Vec4 | undefined;
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
                        ({ width, height } = framebufferInfo.depthStencil!.info);
                    }
                    framebufferInfo.width = width;
                    framebufferInfo.height = height;

                    framebufferInfo.renderPass = render.getRenderPass(framebufferInfo, clears);
                    framebuffer = device.createFramebuffer(framebufferInfo);
                    viewport = vec4.create(0, 0, 1, 1);
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
        info.width = texture.extent?.[0] || device.swapchain.width;
        info.height = texture.extent?.[1] || device.swapchain.height;
        return device.createTexture(info);
    }
}