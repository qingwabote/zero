import { Framebuffer } from "../gfx/Framebuffer.js";
import Pipeline, { ClearFlagBit, PipelineLayout, SampleCountFlagBits, VertexInputState } from "../gfx/Pipeline.js";
import RenderPass, { AttachmentDescription, ImageLayout, LOAD_OP, RenderPassInfo } from "../gfx/RenderPass.js";
import Texture, { TextureUsageBit } from "../gfx/Texture.js";
import Model from "./Model.js";
import Pass from "./Pass.js";
import RenderCamera from "./RenderCamera.js";
import RenderDirectionalLight from "./RenderDirectionalLight.js";
import { RenderNode } from "./RenderNode.js";

type RenderObject = RenderNode | RenderCamera | RenderDirectionalLight;

export default class RenderScene {
    private _directionalLight!: RenderDirectionalLight;
    get directionalLight(): RenderDirectionalLight {
        return this._directionalLight;
    }
    set directionalLight(value: RenderDirectionalLight) {
        this._directionalLight = value;
        this._dirtyObjects.set(value, value);
    }

    private _cameras: RenderCamera[] = [];
    get cameras(): RenderCamera[] {
        return this._cameras;
    }

    private _models: Model[] = [];
    get models(): Model[] {
        return this._models;
    }

    private _dirtyObjects: Map<RenderObject, RenderObject> = new Map;
    get dirtyObjects(): Map<RenderObject, RenderObject> {
        return this._dirtyObjects;
    }

    private _clearFlag2renderPass: Record<string, RenderPass> = {};

    private _pipelineCache: Record<string, Pipeline> = {};

    private _framebuffer: Framebuffer;
    get framebuffer(): Framebuffer {
        return this._framebuffer;
    }

    constructor() {
        let samples: SampleCountFlagBits = SampleCountFlagBits.SAMPLE_COUNT_1 as number;

        const colorAttachments: Texture[] = [];
        const resolveAttachments: Texture[] = [];
        if (samples == SampleCountFlagBits.SAMPLE_COUNT_1) {
            colorAttachments.push(gfx.swapchain.colorTexture);
        } else {
            const colorAttachment = gfx.createTexture();
            colorAttachment.initialize({
                samples,
                usage: TextureUsageBit.COLOR_ATTACHMENT,
                width: zero.window.width, height: zero.window.height
            })
            colorAttachments.push(colorAttachment);
            resolveAttachments.push(gfx.swapchain.colorTexture);
        }

        const depthStencilAttachment = gfx.createTexture();
        depthStencilAttachment.initialize({
            samples,
            usage: TextureUsageBit.DEPTH_STENCIL_ATTACHMENT | TextureUsageBit.SAMPLED,
            width: zero.window.width, height: zero.window.height
        });
        const framebuffer = gfx.createFramebuffer();
        framebuffer.initialize({
            colorAttachments,
            depthStencilAttachment,
            resolveAttachments,
            renderPass: this.getRenderPass(ClearFlagBit.COLOR, samples),
            width: zero.window.width, height: zero.window.height
        });
        this._framebuffer = framebuffer;
    }

    update(dt: number) {
        for (let i = 0; i < this._models.length; i++) {
            this._models[i].update()
        }
    }

    getRenderPass(clearFlags: ClearFlagBit, samples = SampleCountFlagBits.SAMPLE_COUNT_1): RenderPass {
        const hash = `${clearFlags}${samples}`;
        let renderPass = this._clearFlag2renderPass[hash];
        if (!renderPass) {
            const colorAttachments: AttachmentDescription[] = [];
            const resolveAttachments: AttachmentDescription[] = [];
            if (samples == SampleCountFlagBits.SAMPLE_COUNT_1) {
                colorAttachments.push({
                    loadOp: clearFlags & ClearFlagBit.COLOR ? LOAD_OP.CLEAR : LOAD_OP.LOAD,
                    initialLayout: clearFlags & ClearFlagBit.COLOR ? ImageLayout.UNDEFINED : ImageLayout.PRESENT_SRC,
                    finalLayout: ImageLayout.PRESENT_SRC
                })
            } else {
                colorAttachments.push({
                    loadOp: clearFlags & ClearFlagBit.COLOR ? LOAD_OP.CLEAR : LOAD_OP.LOAD,
                    initialLayout: clearFlags & ClearFlagBit.COLOR ? ImageLayout.UNDEFINED : ImageLayout.COLOR_ATTACHMENT_OPTIMAL,
                    finalLayout: ImageLayout.COLOR_ATTACHMENT_OPTIMAL
                });
                resolveAttachments.push({
                    loadOp: clearFlags & ClearFlagBit.COLOR ? LOAD_OP.CLEAR : LOAD_OP.LOAD,
                    initialLayout: clearFlags & ClearFlagBit.COLOR ? ImageLayout.UNDEFINED : ImageLayout.PRESENT_SRC,
                    finalLayout: ImageLayout.PRESENT_SRC
                })
            }

            const depthStencilAttachment: AttachmentDescription = {
                loadOp: clearFlags & ClearFlagBit.DEPTH ? LOAD_OP.CLEAR : LOAD_OP.LOAD,
                initialLayout: clearFlags & ClearFlagBit.DEPTH ? ImageLayout.UNDEFINED : ImageLayout.DEPTH_STENCIL_ATTACHMENT_OPTIMAL,
                finalLayout: ImageLayout.DEPTH_STENCIL_ATTACHMENT_OPTIMAL
            };
            renderPass = gfx.createRenderPass();
            renderPass.initialize(new RenderPassInfo(colorAttachments, depthStencilAttachment, resolveAttachments, samples));
            this._clearFlag2renderPass[hash] = renderPass;
        }
        return renderPass;
    }

    getPipeline(pass: Pass, vertexInputState: VertexInputState, compatibleRenderPass: RenderPass, layout: PipelineLayout): Pipeline {
        // https://registry.khronos.org/vulkan/specs/1.3-extensions/html/vkspec.html#renderpass-compatibility
        const compatibleRenderPassHash = `${compatibleRenderPass.info.colorAttachments.length}1${compatibleRenderPass.info.resolveAttachments.length}${compatibleRenderPass.info.samples}`

        const pipelineHash = pass.hash + vertexInputState.hash + compatibleRenderPassHash;

        let pipeline = this._pipelineCache[pipelineHash];
        if (!pipeline) {
            pipeline = gfx.createPipeline();
            pipeline.initialize({ shader: pass.shader, vertexInputState, renderPass: compatibleRenderPass, layout, rasterizationState: pass.rasterizationState });
            this._pipelineCache[pipelineHash] = pipeline;
        }
        return pipeline;
    }
}