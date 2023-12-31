import { device } from "boot";
import * as gfx from "gfx";
import { VisibilityFlagBits } from "../VisibilityFlagBits.js";
import { render, shaderLib } from "../core/index.js";
import { Rect, rect } from "../core/math/rect.js";
import { Context } from "../core/render/Context.js";
import { getRenderPass } from "../core/render/pipeline/rpc.js";
import { ModelPhase, ShadowUniform } from "../pipeline/index.js";
import { CameraUniform } from "../pipeline/uniforms/CameraUniform.js";
import { LightUniform } from "../pipeline/uniforms/LightUniform.js";
import { ShadowMapUniform } from "../pipeline/uniforms/ShadowMapUniform.js";
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
    width?: number;
    height?: number;
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
    shadowMap: ShadowMapUniform
}

interface Uniform {
    name: keyof typeof UniformMap;
    [key: string]: any;
}

interface Viewport {
    x?: number;
    y?: number;
    width: number;
    height: number;
}

interface Stage {
    name: string;
    phases: Phase[];
    framebuffer?: Framebuffer;
    renderPass?: RenderPass;
    viewport?: Viewport;
}

interface Resource {
    textures?: Texture[];
    uniforms?: Uniform[];
    stages: Stage[];
}

export class Flow extends Yml {
    private _resource!: Resource;

    private _textures: Record<string, gfx.Texture> = {};

    protected async onParse(res: any): Promise<void> {
        this._resource = res;
    }

    public createFlow(variables: Record<string, any> = {}): render.Flow {
        if (this._resource.textures) {
            for (const texture of this._resource.textures) {
                this._textures[texture.name] = this.createTexture(texture);
            }
        }

        const descriptorSetLayoutInfo = new gfx.DescriptorSetLayoutInfo;
        if (this._resource.uniforms) {
            for (const uniform of this._resource.uniforms) {
                if (uniform.name in UniformMap) {
                    descriptorSetLayoutInfo.bindings.add(shaderLib.createDescriptorSetLayoutBinding(UniformMap[uniform.name].definition))
                } else {
                    throw `unsupported uniform: ${uniform}`;
                }
            }
        }
        const descriptorSetLayout = device.createDescriptorSetLayout(descriptorSetLayoutInfo);
        const context = new Context(descriptorSetLayout);
        const uniforms: render.Uniform[] = [];
        if (this._resource.uniforms) {
            for (const uniform of this._resource.uniforms) {
                let instance;
                if (uniform.name == 'shadowMap') {
                    instance = new UniformMap[uniform.name](context, this._textures[uniform.texture]);
                } else {
                    instance = new UniformMap[uniform.name](context);
                }
                uniforms.push(instance);
            }
        }

        const stages: render.Stage[] = [];
        for (let i = 0; i < this._resource.stages.length; i++) {
            const stage = this._resource.stages[i];

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
                const { width = device.swapchain.width, height = device.swapchain.height } = stage.framebuffer;
                framebufferInfo.width = width;
                framebufferInfo.height = height;
                if (stage.framebuffer.colors) {
                    for (const texture of stage.framebuffer.colors) {
                        framebufferInfo.colors.add(this.createTexture(texture, stage.framebuffer.samples, width, height));
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
                    framebufferInfo.depthStencil = this.createTexture(stage.framebuffer.depthStencil, stage.framebuffer.samples, width, height);
                }

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
                }
            }
            stages.push(new render.Stage(stage.name, phases, framebuffer, renderPass, viewport));
        }
        context.flow = new render.Flow(context, uniforms, stages);
        return context.flow;
    }

    private createTexture(texture: Texture | string, samples?: gfx.SampleCountFlagBits, width?: number, height?: number) {
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
        info.width = texture.width | width!;
        info.height = texture.height | height!;
        return device.createTexture(info);
    }
}