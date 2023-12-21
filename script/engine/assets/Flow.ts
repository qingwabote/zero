import { device, load } from "boot";
import * as gfx from "gfx";
import { parse } from "yaml";
import { VisibilityFlagBits } from "../VisibilityFlagBits.js";
import { render } from "../core/index.js";
import { Rect, rect } from "../core/math/rect.js";
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
    usage: TextureUsage[];
    swapchain: boolean;
}

interface Framebuffer {
    width?: number;
    height?: number;
    colors?: Texture[];
    resolves?: Texture[];
    depthStencil?: Texture;
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

type Uniform = keyof typeof UniformMap;

interface Viewport {
    x?: number;
    y?: number;
    width: number;
    height: number;
}

interface Stage {
    uniforms?: Uniform[];
    phases: Phase[];
    framebuffer?: Framebuffer;
    renderPass?: RenderPass;
    viewport?: Viewport;
}

export class Flow extends Yml {
    private _stages: Stage[] = [];
    private _names: string[] = [];

    protected async onParse(res: any): Promise<void> {
        const stages: string[] = res.stages;
        for (let path of stages) {
            this._stages.push(parse(await load(this.resolvePath(path) + '.yml', 'text')));
            this._names.push(path.match(/(.+)\/(.+)$/)![2]);
        }
    }

    public createFlow(variables: Record<string, any> = {}): render.Flow {
        const stages: render.Stage[] = [];
        for (let i = 0; i < this._stages.length; i++) {
            const stage = this._stages[i];
            const uniforms: (new () => render.Uniform)[] = [];
            if (stage.uniforms) {
                for (const uniform of stage.uniforms) {
                    if (uniform in UniformMap) {
                        uniforms.push(UniformMap[uniform])
                    } else {
                        throw `unsupported uniform: ${uniform}`;
                    }
                }
            }
            if (!uniforms.includes(CameraUniform)) {
                uniforms.push(CameraUniform);
            }

            const phases: ModelPhase[] = [];
            for (const phase of stage.phases) {
                let visibility: VisibilityFlagBits | undefined;
                if (phase.visibility) {
                    visibility = Number(this.resolveVar(phase.visibility, variables));
                }
                phases.push(new ModelPhase(phase.pass, visibility))
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
                        const info = new gfx.TextureInfo;
                        if (stage.framebuffer.samples) {
                            info.samples = stage.framebuffer.samples;
                        }
                        for (const usage of texture.usage) {
                            info.usage |= gfx.TextureUsageFlagBits[usage];
                        }
                        info.width = width;
                        info.height = height;
                        framebufferInfo.colors.add(device.createTexture(info));
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
                    const info = new gfx.TextureInfo;
                    if (stage.framebuffer.samples) {
                        info.samples = stage.framebuffer.samples;
                    }
                    for (const usage of stage.framebuffer.depthStencil.usage) {
                        info.usage |= gfx.TextureUsageFlagBits[usage];
                    }
                    info.width = width;
                    info.height = height;
                    framebufferInfo.depthStencil = device.createTexture(info);
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
            stages.push(new render.Stage(this._names[i], uniforms, phases, framebuffer, renderPass, viewport));
        }
        return new render.Flow(stages);
    }
}