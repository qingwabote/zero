import { CommandBuffer, DescriptorSet, PipelineLayout, Uint32Vector } from "gfx";
import { Zero } from "../../Zero.js";
import { shaderLib } from "../../shaderLib.js";
import { Root } from "../scene/Root.js";
import { Stage } from "./Stage.js";
import { Uniform } from "./Uniform.js";

export class Flow {
    constructor(
        private readonly _uniforms: readonly Uniform[],
        readonly pipelineLayout: PipelineLayout,
        readonly descriptorSet: DescriptorSet,
        readonly stages: readonly Stage[]
    ) {
    }

    start() {
        for (const uniform of this._uniforms) {
            uniform.initialize(this);
        }
    }

    update() {
        for (const uniform of this._uniforms) {
            uniform.update();
        }
    }

    record(commandBuffer: CommandBuffer, scene: Root): number {
        let drawCall = 0;
        const renderScene = Zero.instance.scene;
        for (let cameraIndex = 0; cameraIndex < renderScene.cameras.length; cameraIndex++) {
            const camera = renderScene.cameras[cameraIndex];
            const dynamicOffsets = new Uint32Vector;
            dynamicOffsets.add(shaderLib.sets.global.uniforms.Camera.size * cameraIndex);
            commandBuffer.bindDescriptorSet(this.pipelineLayout, shaderLib.sets.global.index, this.descriptorSet, dynamicOffsets);
            for (const stage of this.stages) {
                drawCall += stage.record(commandBuffer, scene, camera);
            }
        }
        return drawCall;
    }
}