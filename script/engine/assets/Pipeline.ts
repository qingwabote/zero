import { device } from "boot";
import * as gfx from "gfx";
import { VisibilityFlagBits } from "../VisibilityFlagBits.js";
import { getSampler, render } from "../core/index.js";
import { Rect, rect } from "../core/math/rect.js";
import { Context } from "../core/render/Context.js";
import { UniformBufferObject } from "../core/render/pipeline/UniformBufferObject.js";
import { getRenderPass } from "../core/render/pipeline/rpc.js";
import { ModelPhase, ShadowUniform } from "../pipeline/index.js";
import { CameraUniform } from "../pipeline/uniforms/CameraUniform.js";
import { LightUniform } from "../pipeline/uniforms/LightUniform.js";
import { SamplerTextureUniform } from "../pipeline/uniforms/SamplerTextureUniform.js";
import { Yml } from "./internal/Yml.js";

interface Phase {
    pass: string;
    visibility?: string;
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
    colors?: Texture[];
    resolves?: Texture[];
    depthStencil?: Texture | string;
    samples?: number;
}

type Clear = keyof typeof gfx.ClearFlagBits;

interface RenderPass {
    clears: Clear[];
}

const UniformMap = {
    camera: CameraUniform,
    light: LightUniform,
    shadow: ShadowUniform,
    samplerTexture: SamplerTextureUniform
}

interface Uniform {
    name: keyof typeof UniformMap;
    binding: number;
    [key: string]: any;
}

interface Viewport {
    x?: number;
    y?: number;
    width: number;
    height: number;
}

interface Stage {
    phases: Phase[];
    framebuffer?: Framebuffer;
    renderPass?: RenderPass;
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

    protected async onParse(res: any): Promise<void> {
        this._resource = res;
    }

    public createRenderPipeline(variables: Record<string, any> = {}): render.Pipeline {
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
                    let instance = new UniformMap[uniform.name](context);
                    if (instance instanceof UniformBufferObject) {
                        context.descriptorSet.bindBuffer(uniform.binding, instance.buffer, instance.range);
                    } else if (instance instanceof SamplerTextureUniform) {
                        context.descriptorSet.bindTexture(uniform.binding, this._textures[uniform.texture], getSampler(gfx.Filter.NEAREST, gfx.Filter.NEAREST));
                    }
                    uniforms.push(instance);
                }
            }

            const stages: render.Stage[] = [];
            for (let i = 0; i < flow.stages.length; i++) {
                const stage = flow.stages[i];

                const phases: ModelPhase[] = [];
                for (const phase of stage.phases) {
                    let visibility: VisibilityFlagBits | undefined;
                    if (phase.visibility) {
                        visibility = Number(this.resolveVar(phase.visibility, variables));
                    }
                    phases.push(new ModelPhase(context, phase.pass, visibility))
                }
                let framebuffer: gfx.Framebuffer | undefined;
                let renderPass: gfx.RenderPass | undefined;
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

                    let clears: gfx.ClearFlagBits | undefined;
                    if (stage.renderPass?.clears) {
                        clears = 0;
                        for (const clear of stage.renderPass.clears) {
                            clears |= gfx.ClearFlagBits[clear];
                        }
                    }
                    framebufferInfo.renderPass = getRenderPass(framebufferInfo, clears);
                    if (stage.renderPass) {
                        renderPass = framebufferInfo.renderPass;
                    }
                    framebuffer = device.createFramebuffer(framebufferInfo);
                    if (stage.viewport) {
                        viewport = rect.create(stage.viewport.x, stage.viewport.y, stage.viewport.width, stage.viewport.height);
                    } else {
                        viewport = rect.create(0, 0, width, height);
                    }
                }
                stages.push(new render.Stage(context, phases, framebuffer, renderPass, viewport));
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