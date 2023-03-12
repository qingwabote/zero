import CommandBuffer from "../gfx/CommandBuffer.js";
import { Framebuffer } from "../gfx/Framebuffer.js";
import RenderPass from "../gfx/RenderPass.js";
import { Rect } from "../math/rect.js";
import Camera from "../scene/Camera.js";
import Phase from "./Phase.js";
import Uniform from "./Uniform.js";

export default abstract class Stage {

    readonly visibility: number;

    protected _phases: Phase[];

    private _framebuffer?: Framebuffer;
    get framebuffer(): Framebuffer {
        return this._framebuffer || zero.flow.framebuffer;
    }

    private _renderPass?: RenderPass;

    private _viewport?: Rect;

    private _drawCalls: number = 0;
    get drawCalls() {
        return this._drawCalls;
    }

    constructor(phases: Phase[], framebuffer?: Framebuffer, renderPass?: RenderPass, viewport?: Rect) {
        this.visibility = phases.reduce(function (val, phase) { return phase.visibility | val }, 0)
        this._phases = phases;

        this._framebuffer = framebuffer;
        this._renderPass = renderPass;
        this._viewport = viewport;
    }

    abstract getRequestedUniforms(): (new () => Uniform)[];

    record(commandBuffer: CommandBuffer, camera: Camera): void {
        const framebuffer = this.framebuffer;
        const renderPass = this._renderPass || zero.flow.getRenderPass(camera.clearFlags, framebuffer.info.colorAttachments[0].info.samples);
        const viewport = this._viewport || camera.viewport;

        commandBuffer.beginRenderPass(renderPass, framebuffer, viewport);

        this._drawCalls = 0;
        for (const phase of this._phases) {
            if ((camera.visibilityFlags & phase.visibility) == 0) {
                continue;
            }
            phase.record(commandBuffer, camera, renderPass);
            this._drawCalls += phase.drawCalls;
        }

        commandBuffer.endRenderPass()
    }
}