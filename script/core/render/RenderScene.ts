import CommandBuffer from "../gfx/CommandBuffer.js";
import Pipeline, { DescriptorSet, PipelineLayout, VertexInputState } from "../gfx/Pipeline.js";
import RenderPass from "../gfx/RenderPass.js";
import Shader from "../gfx/Shader.js";
import shaders from "../shaders.js";
import Model from "./Model.js";
import Pass from "./Pass.js";
import DefaultPhase from "./phases/DefaultPhase.js";
import ShadowmapPhase from "./phases/ShadowmapPhase.js";
import RenderCamera from "./RenderCamera.js";
import RenderDirectionalLight from "./RenderDirectionalLight.js";
import { RenderNode } from "./RenderNode.js";
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

    private _pipelineLayoutCache: Record<string, PipelineLayout> = {};
    private _pipelineCache: Record<string, Pipeline> = {};

    private _globalDescriptorSet: DescriptorSet;

    private _uboGlobal: UboGlobal;

    private _defaultPhase: DefaultPhase;
    private _shadowmapPhase: ShadowmapPhase;
    get shadowmapPhase(): ShadowmapPhase {
        return this._shadowmapPhase;
    }

    constructor() {
        const globalDescriptorSet = gfx.createDescriptorSet();
        globalDescriptorSet.initialize(shaders.builtinDescriptorSetLayouts.global);

        this._uboGlobal = new UboGlobal(globalDescriptorSet);

        this._defaultPhase = new DefaultPhase;
        this._shadowmapPhase = new ShadowmapPhase(globalDescriptorSet);

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
            if (camera.visibilities & this._directionalLight.node.visibility) {
                this._shadowmapPhase.record(commandBuffer, camera);
            }
            this._defaultPhase.record(commandBuffer, camera);
        }
        commandBuffer.end();
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