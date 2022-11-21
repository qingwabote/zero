import shaders from "../shaders.js";
import ShadowmapPhase from "./phases/ShadowmapPhase.js";
import RenderPhase, { PhaseBit } from "./RenderPhase.js";
import UboGlobal from "./UboGlobal.js";
export default class RenderScene {
    _directionalLight;
    get directionalLight() {
        return this._directionalLight;
    }
    set directionalLight(value) {
        this._directionalLight = value;
        this._dirtyObjects.set(value, value);
    }
    _cameras = [];
    get cameras() {
        return this._cameras;
    }
    _models = [];
    get models() {
        return this._models;
    }
    _dirtyObjects = new Map;
    get dirtyObjects() {
        return this._dirtyObjects;
    }
    _pipelineLayoutCache = {};
    _pipelineCache = {};
    _globalDescriptorSet;
    _uboGlobal;
    _shadowmapPhase;
    get shadowmapPhase() {
        return this._shadowmapPhase;
    }
    _renderPhases = [];
    get renderPhases() {
        return this._renderPhases;
    }
    constructor() {
        const globalDescriptorSet = gfx.createDescriptorSet();
        globalDescriptorSet.initialize(shaders.builtinDescriptorSetLayouts.global);
        this._uboGlobal = new UboGlobal(globalDescriptorSet);
        const shadowmapPhase = new ShadowmapPhase(globalDescriptorSet);
        this._renderPhases.push(shadowmapPhase);
        this._shadowmapPhase = shadowmapPhase;
        this._renderPhases.push(new RenderPhase(PhaseBit.DEFAULT));
        this._globalDescriptorSet = globalDescriptorSet;
    }
    update(dt) {
        this._uboGlobal.update();
        for (let i = 0; i < this._models.length; i++) {
            this._models[i].update();
        }
        this._dirtyObjects.clear();
    }
    record(commandBuffer) {
        commandBuffer.begin();
        for (let cameraIndex = 0; cameraIndex < this._cameras.length; cameraIndex++) {
            const camera = this._cameras[cameraIndex];
            commandBuffer.bindDescriptorSet(shaders.builtinGlobalPipelineLayout, shaders.builtinUniforms.global.set, this._globalDescriptorSet, [cameraIndex * shaders.builtinUniforms.global.blocks.Camera.size]);
            for (const renderPhase of this._renderPhases) {
                if ((renderPhase.phase & camera.phases) == 0) {
                    continue;
                }
                renderPhase.record(commandBuffer, camera);
            }
        }
        commandBuffer.end();
    }
    getPipeline(pass, vertexInputState, renderPass, layout) {
        const pipelineHash = pass.hash + vertexInputState.hash + renderPass.info.hash;
        let pipeline = this._pipelineCache[pipelineHash];
        if (!pipeline) {
            pipeline = gfx.createPipeline();
            pipeline.initialize({ shader: pass.shader, vertexInputState, renderPass, layout, rasterizationState: pass.rasterizationState });
            this._pipelineCache[pipelineHash] = pipeline;
        }
        return pipeline;
    }
    getPipelineLayout(shader) {
        let layout = this._pipelineLayoutCache[shader.info.hash];
        if (!layout) {
            layout = gfx.createPipelineLayout();
            layout.initialize([
                shaders.builtinDescriptorSetLayouts.global,
                shaders.builtinDescriptorSetLayouts.local,
                shaders.getDescriptorSetLayout(shader)
            ]);
            this._pipelineLayoutCache[shader.info.hash] = layout;
        }
        return layout;
    }
}
//# sourceMappingURL=RenderScene.js.map