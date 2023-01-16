import CommandBuffer from "../gfx/CommandBuffer.js";
import { Framebuffer } from "../gfx/Framebuffer.js";
import RenderPass from "../gfx/RenderPass.js";
import { Rect } from "../math/rect.js";
import RenderCamera from "../render/RenderCamera.js";
import PipelineUniform from "./PipelineUniform.js";
import RenderPhase from "./RenderPhase.js";

export default abstract class RenderStage {
    protected _phases: RenderPhase[];

    private _framebuffer?: Framebuffer;
    get framebuffer(): Framebuffer {
        return this._framebuffer || zero.renderFlow.framebuffer;
    }

    private _renderPass?: RenderPass;

    private _viewport?: Rect;

    private _drawCalls: number = 0;
    get drawCalls() {
        return this._drawCalls;
    }

    constructor(phases: RenderPhase[], framebuffer?: Framebuffer, renderPass?: RenderPass, viewport?: Rect) {
        this._phases = phases;
        this._framebuffer = framebuffer;
        this._renderPass = renderPass;
        this._viewport = viewport;
    }

    abstract getRequestedUniforms(): (new () => PipelineUniform)[];

    record(commandBuffer: CommandBuffer, camera: RenderCamera): void {
        const framebuffer = this.framebuffer;
        const renderPass = this._renderPass || zero.renderFlow.getRenderPass(camera.clearFlags, framebuffer.info.colorAttachments[0].info.samples);
        const viewport = this._viewport || camera.viewport;

        commandBuffer.beginRenderPass(renderPass, framebuffer, viewport);

        this._drawCalls = 0;
        for (const phase of this._phases) {
            if ((camera.visibilities & phase.visibility) == 0) {
                continue;
            }
            phase.record(commandBuffer, camera, renderPass);
            this._drawCalls += phase.drawCalls;
        }

        commandBuffer.endRenderPass()
    }
}