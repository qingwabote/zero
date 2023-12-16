import { device } from "boot";
import { CommandBuffer, DescriptorSet, DescriptorSetLayoutInfo, PipelineLayout, PipelineLayoutInfo, Uint32Vector } from "gfx";
import { Zero } from "../../Zero.js";
import { shaderLib } from "../../shaderLib.js";
import { Root } from "../scene/Root.js";
import { Stage } from "./Stage.js";
import { Uniform } from "./Uniform.js";

export class Flow {
    private _drawCall: number = 0;
    get drawCall() {
        return this._drawCall;
    }

    readonly globalDescriptorSet: DescriptorSet;

    private _uniforms: Uniform[] = [];

    private _globalPipelineLayout: PipelineLayout;

    constructor(readonly stages: readonly Stage[]) {
        const uniforms: Set<new () => Uniform> = new Set;
        for (const stage of stages) {
            for (const uniform of stage.uniforms) {
                uniforms.add(uniform);
            }
        }

        const descriptorSetLayoutInfo = new DescriptorSetLayoutInfo;
        for (const uniform of uniforms) {
            const instance = new uniform;
            descriptorSetLayoutInfo.bindings.add(shaderLib.createDescriptorSetLayoutBinding(instance.definition))
            this._uniforms.push(instance);
        }

        const descriptorSetLayout = device.createDescriptorSetLayout(descriptorSetLayoutInfo);
        (descriptorSetLayout as any).name = "global descriptorSetLayout";

        const pipelineLayoutInfo = new PipelineLayoutInfo;
        pipelineLayoutInfo.layouts.add(descriptorSetLayout);
        this._globalPipelineLayout = device.createPipelineLayout(pipelineLayoutInfo);

        this.globalDescriptorSet = device.createDescriptorSet(descriptorSetLayout);
    }

    start() {
        for (const uniform of this._uniforms) {
            uniform.initialize();
        }
    }

    update() {
        for (const uniform of this._uniforms) {
            uniform.update();
        }
    }

    record(commandBuffer: CommandBuffer, scene: Root) {
        this._drawCall = 0;

        const renderScene = Zero.instance.scene;
        for (let cameraIndex = 0; cameraIndex < renderScene.cameras.length; cameraIndex++) {
            const camera = renderScene.cameras[cameraIndex];
            const dynamicOffsets = new Uint32Vector;
            dynamicOffsets.add(shaderLib.sets.global.uniforms.Camera.size * cameraIndex);
            commandBuffer.bindDescriptorSet(this._globalPipelineLayout, shaderLib.sets.global.index, this.globalDescriptorSet, dynamicOffsets);
            for (const stage of this.stages) {
                this._drawCall += stage.record(commandBuffer, scene, camera);
            }
        }
    }
}