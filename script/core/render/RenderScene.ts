import CommandBuffer from "../gfx/CommandBuffer.js";
import Pipeline, { PipelineLayout, VertexInputState } from "../gfx/Pipeline.js";
import RenderPass from "../gfx/RenderPass.js";
import Shader from "../gfx/Shader.js";
import Model from "./Model.js";
import DefaultPhase from "./phases/DefaultPhase.js";
import ShadowmapPhase from "./phases/ShadowmapPhase.js";
import RenderCamera from "./RenderCamera.js";
import RenderDirectionalLight from "./RenderDirectionalLight.js";

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

    private _dirtyObjects: Map<any, any> = new Map;
    get dirtyObjects(): Map<any, any> {
        return this._dirtyObjects;
    }

    private _pipelineCache: Record<string, Pipeline> = {};

    private _defaultPhase: DefaultPhase;
    private _shadowmapPhase: ShadowmapPhase;

    constructor() {
        this._defaultPhase = new DefaultPhase;
        this._shadowmapPhase = new ShadowmapPhase;
    }

    update(dt: number) {
        this._shadowmapPhase.update();
        this._defaultPhase.update();

        for (let i = 0; i < this._models.length; i++) {
            this._models[i].update()
        }

        this._dirtyObjects.clear();
    }

    record(commandBuffer: CommandBuffer) {
        commandBuffer.begin();
        for (let cameraIndex = 0; cameraIndex < this._cameras.length; cameraIndex++) {
            const camera = this._cameras[cameraIndex];
            // if (camera.visibilities & this._directionalLight.node.visibility) {
            //     this._shadowmapPhase.record(commandBuffer, cameraIndex);
            // }

            this._defaultPhase.record(commandBuffer, cameraIndex);
        }
        commandBuffer.end();
    }

    getPipeline(shader: Shader, vertexInputState: VertexInputState, renderPass: RenderPass, layout: PipelineLayout): Pipeline {
        const pipelineHash = shader.info.hash + vertexInputState.hash + renderPass.info.hash;
        let pipeline = this._pipelineCache[pipelineHash];
        if (!pipeline) {
            pipeline = gfx.createPipeline();
            pipeline.initialize({ shader, vertexInputState, renderPass, layout });
            this._pipelineCache[pipelineHash] = pipeline;
        }
        return pipeline;
    }
}