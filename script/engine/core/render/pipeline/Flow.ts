import { CommandBuffer, Uint32Vector } from "gfx";
import { Zero } from "../../Zero.js";
import { shaderLib } from "../../shaderLib.js";
import { Context } from "../Context.js";
import { Root } from "../scene/Root.js";
import { Stage } from "./Stage.js";
import { Uniform } from "./Uniform.js";

export class Flow {
    constructor(
        private readonly _context: Context,
        private readonly _uniforms: readonly Uniform[],
        readonly stages: readonly Stage[]
    ) {
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
            commandBuffer.bindDescriptorSet(shaderLib.sets.global.index, this._context.descriptorSet, dynamicOffsets);
            for (const stage of this.stages) {
                drawCall += stage.record(commandBuffer, scene, camera);
            }
        }
        return drawCall;
    }
}