import { device } from "boot";
import { bundle } from "bundling";
import * as gfx from "gfx";
import { VisibilityFlagBits } from "../VisibilityFlagBits.js";
import { getSampler, render, shaderLib } from "../core/index.js";
import { Rect, rect } from "../core/math/rect.js";
import { Context } from "../core/render/Context.js";
import { getRenderPass } from "../core/render/pipeline/rpc.js";
import { ModelPhase, ShadowUniform } from "../pipeline/index.js";
import { PostPhase } from "../pipeline/phases/PostPhase.js";
import { CameraUniform } from "../pipeline/uniforms/CameraUniform.js";
import { LightUniform } from "../pipeline/uniforms/LightUniform.js";
import { SamplerTextureUniform } from "../pipeline/uniforms/SamplerTextureUniform.js";
import { Shader } from "./Shader.js";
import { Yml } from "./internal/Yml.js";

const phaseCreators = {
    model: async function (info: Phase, context: Context, visibility?: VisibilityFlagBits): Promise<render.Phase> {
        return new ModelPhase(context, visibility, info.pass);
    },
    fxaa: async function (info: Phase, context: Context, visibility?: VisibilityFlagBits): Promise<render.Phase> {
        const shaderAsset = await bundle.cache('shaders/fxaa', Shader);
        const shader = shaderLib.getShader(shaderAsset);
        const rasterizationState = new gfx.RasterizationState;
        rasterizationState.cullMode = gfx.CullMode.NONE;

        const blendState = new gfx.BlendState;
        blendState.srcRGB = gfx.BlendFactor.SRC_ALPHA;
        blendState.dstRGB = gfx.BlendFactor.ONE_MINUS_SRC_ALPHA;
        blendState.srcAlpha = gfx.BlendFactor.ONE;
        blendState.dstAlpha = gfx.BlendFactor.ONE_MINUS_SRC_ALPHA

        const passState = new gfx.PassState;
        passState.shader = shader;
        passState.primitive = gfx.PrimitiveTopology.TRIANGLE_LIST;
        passState.rasterizationState = rasterizationState;
        passState.blendState = blendState;

        return new PostPhase(context, passState, visibility);
    },
} as const;

interface Phase {
    type?: 'fxaa';
    visibility?: string;
    [key: string]: any;
}

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

const UniformMap = {
    camera: CameraUniform,
    light: LightUniform,
    shadow: ShadowUniform,
    samplerTexture: SamplerTextureUniform
}

interface UniformBase {
    binding: number;
}

interface Camera extends UniformBase {
    name: 'camera';
}

interface Light extends UniformBase {
    name: 'light';
}

interface Shadow extends UniformBase {
    name: 'shadow';
}

interface SamplerTexture extends UniformBase {
    name: 'samplerTexture';
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
    viewport?: Viewport;
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

    public async createRenderPipeline(variables: Record<string, any> = {}): Promise<render.Pipeline> {
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
                    if (uniform.name in UniformMap) {
                        const definition = UniformMap[uniform.name].definition;
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
            const uniforms: render.Uniform[] = [];
            if (flow.uniforms) {
                for (const uniform of flow.uniforms) {
                    let instance;
                    if (uniform.name == 'samplerTexture') {
                        instance = new UniformMap[uniform.name](context);
                        const filter = uniform.filter ? gfx.Filter[uniform.filter] : gfx.Filter.NEAREST;
                        context.descriptorSet.bindTexture(uniform.binding, this._textures[uniform.texture], getSampler(filter, filter));
                    } else {
                        instance = new UniformMap[uniform.name](context);
                        context.descriptorSet.bindBuffer(uniform.binding, instance.buffer, instance.range);
                    }
                    uniforms.push(instance);
                }
            }

            const stages: render.Stage[] = [];
            for (let i = 0; i < flow.stages.length; i++) {
                const stage = flow.stages[i];

                const phases: render.Phase[] = [];
                for (const phase of stage.phases) {
                    let visibility: VisibilityFlagBits | undefined;
                    if (phase.visibility) {
                        visibility = Number(this.resolveVar(phase.visibility, variables));
                    }
                    phases.push(await phaseCreators[phase.type || 'model'](phase, context, visibility))
                }
                let framebuffer: gfx.Framebuffer | undefined;
                let clears: gfx.ClearFlagBits | undefined;
                let viewport: Rect | undefined;
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

                    if (stage.clears) {
                        clears = gfx.ClearFlagBits.NONE;
                        for (const clear of stage.clears) {
                            clears |= gfx.ClearFlagBits[clear];
                        }
                    }
                    framebufferInfo.renderPass = getRenderPass(framebufferInfo, clears);
                    framebuffer = device.createFramebuffer(framebufferInfo);
                    if (stage.viewport) {
                        viewport = rect.create(stage.viewport.x, stage.viewport.y, stage.viewport.width, stage.viewport.height);
                    } else {
                        viewport = rect.create(0, 0, width, height);
                    }
                }
                stages.push(new render.Stage(context, phases, framebuffer, clears, viewport));
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