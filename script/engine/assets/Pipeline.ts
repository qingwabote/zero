import { device } from "boot";
import { bundle } from "bundling";
import * as gfx from "gfx";
import { getSampler, render, shaderLib } from "../core/index.js";
import { Rect, rect } from "../core/math/rect.js";
import { Context } from "../core/render/Context.js";
import { UniformBufferObject } from "../core/render/index.js";
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
post_blendState.dstAlpha = gfx.BlendFactor.ONE_MINUS_SRC_ALPHA

const phaseCreators = {
    model: async function (info: ModelPhaseInfo, context: Context, visibility: number): Promise<render.Phase> {
        return new ModelPhase(context, visibility, info.model, info.pass);
    },
    fxaa: async function (info: FxaaPhaseInfo, context: Context, visibility: number): Promise<render.Phase> {
        const shaderAsset = await bundle.cache('shaders/fxaa', Shader);
        const shader = shaderLib.getShader(shaderAsset);

        const passState = new gfx.PassState;
        passState.shader = shader;
        passState.primitive = gfx.PrimitiveTopology.TRIANGLE_LIST;
        passState.rasterizationState = post_rasterizationState;
        passState.blendState = post_blendState;

        return new PostPhase(context, passState, visibility);
    },
    outline: async function (info: OutlinePhaseInfo, context: Context, visibility: number): Promise<render.Phase> {
        const shaderAsset = await bundle.cache('shaders/outline', Shader);
        const shader = shaderLib.getShader(shaderAsset);

        const passState = new gfx.PassState;
        passState.shader = shader;
        passState.primitive = gfx.PrimitiveTopology.TRIANGLE_LIST;
        passState.rasterizationState = post_rasterizationState;
        passState.blendState = post_blendState;

        return new PostPhase(context, passState, visibility);
    },
    copy: async function (info: CopyPhaseInfo, context: Context, visibility: number): Promise<render.Phase> {
        const shaderAsset = await bundle.cache('shaders/copy', Shader);
        const shader = shaderLib.getShader(shaderAsset);

        const passState = new gfx.PassState;
        passState.shader = shader;
        passState.primitive = gfx.PrimitiveTopology.TRIANGLE_LIST;
        passState.rasterizationState = post_rasterizationState;
        passState.blendState = post_blendState;

        return new PostPhase(context, passState, visibility);
    },
} as const;

interface PhaseBase {
    visibility?: string;
}

interface ModelPhaseInfo extends PhaseBase {
    type?: 'model';
    model?: string;
    pass?: string;
}

interface FxaaPhaseInfo extends PhaseBase {
    type: 'fxaa';
}

interface OutlinePhaseInfo extends PhaseBase {
    type: 'outline';
}

interface CopyPhaseInfo extends PhaseBase {
    type: 'copy';
}

type Phase = ModelPhaseInfo | FxaaPhaseInfo;

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
}

const uniformInstances: Map<typeof UniformBufferObject, UniformBufferObject> = new Map;

interface UniformBase {
    binding: number;
}

interface Camera extends UniformBase {
    type: 'camera';
}

interface Light extends UniformBase {
    type: 'light';
}

interface Shadow extends UniformBase {
    type: 'shadow';
}

interface SamplerTexture extends UniformBase {
    type: 'samplerTexture';
    texture: string;
    filter: keyof typeof gfx.Filter;
}

type Uniform = Camera | Light | Shadow | SamplerTexture

interface Viewport {
    x?: number;
    y?: number;
    width: number;
    height: number;
}

interface Stage {
    phases: Phase[];
    framebuffer?: Framebuffer;
    clears?: Clear[];
}

interface Flow {
    uniforms?: Uniform[];
    stages: Stage[];
}

interface Resource {
    textures?: Texture[];
    flows: Flow[];
}

export class Pipeline extends Yml {
    private _resource!: Resource;

    private _textures: Record<string, gfx.Texture> = {};
    public get textures(): Readonly<Record<string, gfx.Texture>> {
        return this._textures;
    }

    protected async onParse(res: Resource): Promise<void> {
        this._resource = res;
    }

    public async instantiate(variables: Record<string, any> = {}): Promise<render.Pipeline> {
        if (this._resource.textures) {
            for (const texture of this._resource.textures) {
                this._textures[texture.name] = this.createTexture(texture);
            }
        }

        const flows: render.Flow[] = [];
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
                        descriptorSetLayoutInfo.bindings.add(binding)
                    } else {
                        throw `unsupported uniform: ${uniform}`;
                    }
                }
            }
            const descriptorSetLayout = device.createDescriptorSetLayout(descriptorSetLayoutInfo);
            const context = new Context(descriptorSetLayout);
            const uniforms: render.UniformBufferObject[] = [];
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

            const stages: render.Stage[] = [];
            for (let i = 0; i < flow.stages.length; i++) {
                const stage = flow.stages[i];

                const phases: render.Phase[] = [];
                for (const phase of stage.phases) {
                    let visibility = 0xffffffff;
                    if (phase.visibility) {
                        visibility = Number(this.resolveVar(phase.visibility, variables));
                    }
                    const type = phase.type || 'model';
                    if (type in phaseCreators) {
                        phases.push(await phaseCreators[type](phase as any, context, visibility))
                    } else {
                        throw `unsupported phase type: ${type}`;
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
                                throw 'not implemented'
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

                    framebufferInfo.renderPass = getRenderPass(framebufferInfo, clears);
                    framebuffer = device.createFramebuffer(framebufferInfo);
                    viewport = rect.create(0, 0, width, height);
                }
                stages.push(new render.Stage(phases, framebuffer, clears, viewport));
            }
            flows.push(new render.Flow(context, uniforms, stages));
        }

        return new render.Pipeline(flows);
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