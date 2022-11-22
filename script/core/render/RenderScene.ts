import CommandBuffer from "../gfx/CommandBuffer.js";
import { Framebuffer } from "../gfx/Framebuffer.js";
import Pipeline, { ClearFlagBit, DescriptorSet, PipelineLayout, VertexInputState } from "../gfx/Pipeline.js";
import RenderPass, { AttachmentDescription, ImageLayout, LOAD_OP } from "../gfx/RenderPass.js";
import Shader from "../gfx/Shader.js";
import { TextureUsageBit } from "../gfx/Texture.js";
import shaders from "../shaders.js";
import Model from "./Model.js";
import Pass from "./Pass.js";
import ShadowmapPhase from "./phases/ShadowmapPhase.js";
import RenderCamera from "./RenderCamera.js";
import RenderDirectionalLight from "./RenderDirectionalLight.js";
import { RenderNode } from "./RenderNode.js";
import RenderPhase, { PhaseBit } from "./RenderPhase.js";
import UboGlobal from "./UboGlobal.js";

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

    private _clearFlag2renderPass: Record<number, RenderPass> = {};

    private _pipelineLayoutCache: Record<string, PipelineLayout> = {};
    private _pipelineCache: Record<string, Pipeline> = {};

    private _globalDescriptorSet: DescriptorSet;

    private _uboGlobal: UboGlobal;

    private _framebuffer: Framebuffer;
    get framebuffer(): Framebuffer {
        return this._framebuffer;
    }

    private _shadowmapPhase: ShadowmapPhase;
    get shadowmapPhase(): ShadowmapPhase {
        return this._shadowmapPhase;
    }

    private _renderPhases: RenderPhase[] = [];
    get renderPhases(): RenderPhase[] {
        return this._renderPhases;
    }

    constructor() {
        const globalDescriptorSet = gfx.createDescriptorSet();
        globalDescriptorSet.initialize(shaders.builtinDescriptorSetLayouts.global);

        this._uboGlobal = new UboGlobal(globalDescriptorSet);

        const depthStencilAttachment = gfx.createTexture();
        depthStencilAttachment.initialize({
            usage: TextureUsageBit.DEPTH_STENCIL_ATTACHMENT | TextureUsageBit.SAMPLED,
            width: zero.window.width, height: zero.window.height
        });
        const framebuffer = gfx.createFramebuffer();
        framebuffer.initialize({
            attachments: [gfx.swapchain.colorTexture, depthStencilAttachment],
            renderPass: this.getRenderPass(ClearFlagBit.COLOR),
            width: zero.window.width, height: zero.window.height
        });
        this._framebuffer = framebuffer;

        const shadowmapPhase = new ShadowmapPhase(globalDescriptorSet);
        this._renderPhases.push(shadowmapPhase);
        this._shadowmapPhase = shadowmapPhase;
        this._renderPhases.push(new RenderPhase(PhaseBit.DEFAULT));

        this._globalDescriptorSet = globalDescriptorSet;
    }

    update(dt: number) {
        this._uboGlobal.update();

        for (let i = 0; i < this._models.length; i++) {
            this._models[i].update()
        }

        this._dirtyObjects.clear();
    }

    record(commandBuffer: CommandBuffer) {
        commandBuffer.begin();
        for (let cameraIndex = 0; cameraIndex < this._cameras.length; cameraIndex++) {
            const camera = this._cameras[cameraIndex];
            commandBuffer.bindDescriptorSet(shaders.builtinGlobalPipelineLayout, shaders.builtinUniforms.global.set, this._globalDescriptorSet,
                [cameraIndex * shaders.builtinUniforms.global.blocks.Camera.size]);
            for (const renderPhase of this._renderPhases) {
                if ((renderPhase.phase & camera.phases) == 0) {
                    continue;
                }
                renderPhase.record(commandBuffer, camera);
            }
        }
        commandBuffer.end();
    }

    getRenderPass(clearFlags: ClearFlagBit): RenderPass {
        let renderPass = this._clearFlag2renderPass[clearFlags];
        if (!renderPass) {
            renderPass = gfx.createRenderPass();
            const colorAttachment: AttachmentDescription = {
                loadOp: clearFlags & ClearFlagBit.COLOR ? LOAD_OP.CLEAR : LOAD_OP.LOAD,
                initialLayout: clearFlags & ClearFlagBit.COLOR ? ImageLayout.UNDEFINED : ImageLayout.PRESENT_SRC,
                finalLayout: ImageLayout.PRESENT_SRC
            };
            const depthStencilAttachment: AttachmentDescription = {
                loadOp: clearFlags & ClearFlagBit.DEPTH ? LOAD_OP.CLEAR : LOAD_OP.LOAD,
                initialLayout: clearFlags & ClearFlagBit.DEPTH ? ImageLayout.UNDEFINED : ImageLayout.DEPTH_STENCIL_ATTACHMENT_OPTIMAL,
                finalLayout: ImageLayout.DEPTH_STENCIL_ATTACHMENT_OPTIMAL
            };
            renderPass.initialize({ colorAttachments: [colorAttachment], depthStencilAttachment, hash: clearFlags.toString() });
            this._clearFlag2renderPass[clearFlags] = renderPass;
        }
        return renderPass;
    }

    getPipeline(pass: Pass, vertexInputState: VertexInputState, renderPass: RenderPass, layout: PipelineLayout): Pipeline {
        const pipelineHash = pass.hash + vertexInputState.hash + renderPass.info.hash;
        let pipeline = this._pipelineCache[pipelineHash];
        if (!pipeline) {
            pipeline = gfx.createPipeline();
            pipeline.initialize({ shader: pass.shader, vertexInputState, renderPass, layout, rasterizationState: pass.rasterizationState });
            this._pipelineCache[pipelineHash] = pipeline;
        }
        return pipeline;
    }

    getPipelineLayout(shader: Shader): PipelineLayout {
        let layout = this._pipelineLayoutCache[shader.info.hash];
        if (!layout) {
            layout = gfx.createPipelineLayout();
            layout.initialize([
                shaders.builtinDescriptorSetLayouts.global,
                shaders.builtinDescriptorSetLayouts.local,
                shaders.getDescriptorSetLayout(shader)
            ])
            this._pipelineLayoutCache[shader.info.hash] = layout;
        }
        return layout;
    }
}