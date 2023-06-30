import CommandBuffer from "../gfx/CommandBuffer.js";
import { Framebuffer } from "../gfx/Framebuffer.js";
import RenderPass from "../gfx/RenderPass.js";
import { Rect } from "../math/rect.js";
import Camera from "../scene/Camera.js";
import Phase from "./Phase.js";
import Uniform from "./Uniform.js";

export default class Stage {
    readonly visibility: number;

    get framebuffer(): Framebuffer {
        return this._framebuffer || zero.flow.framebuffer;
    }

    private _drawCalls: number = 0;
    get drawCalls() {
        return this._drawCalls;
    }

    constructor(
        readonly uniforms: readonly (new () => Uniform)[],
        private _phases: Phase[],
        private _framebuffer?: Framebuffer,
        private _renderPass?: RenderPass,
        private _viewport?: Rect
    ) {
        this.visibility = _phases.reduce(function (val, phase) { return phase.visibility | val }, 0)
    }

    record(commandBuffer: CommandBuffer, camera: Camera): void {
        const framebuffer = this.framebuffer;
        const renderPass = this._renderPass || zero.flow.getRenderPass(camera.clearFlags, framebuffer.info.colorAttachments.get(0).info.samples);
        const viewport = this._viewport || camera.viewport;

        commandBuffer.beginRenderPass(renderPass, framebuffer, viewport.x, viewport.y, viewport.width, viewport.height);

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