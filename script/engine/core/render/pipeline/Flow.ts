import { device } from "boot";
import { CommandBuffer, DescriptorSet, DescriptorSetLayoutInfo, Pipeline, Uint32Vector } from "gfx";
import { shaderLib } from "../../shaderLib.js";
import { Scene } from "../Scene.js";
import { Pass } from "../scene/Pass.js";
import { Batch } from "./Batch.js";
import { Context } from "./Context.js";
import { Profile } from "./Profile.js";
import { getRenderPass } from "./rpc.js";
import { Stage } from "./Stage.js";
import { UBO } from "./UBO.js";

const descriptorSetLayoutNull = device.createDescriptorSetLayout(new DescriptorSetLayoutInfo);

const buffer_pass: Pass[] = [];
const buffer_batch: Batch[] = [];

export class Flow {
    constructor(
        private readonly _context: Context,
        private readonly _ubos: readonly UBO[],
        public readonly stages: readonly Stage[],
        public readonly visibilities: number,
        private readonly _flowLoopIndex: number,
    ) { }

    record(profile: Profile, commandBuffer: CommandBuffer, scene: Scene, cameraIndex: number) {
        const dynamicOffsets = new Uint32Vector;
        for (const uniform of this._ubos) {
            const offset = uniform.dynamicOffset(scene, cameraIndex, this._flowLoopIndex);
            if (offset != -1) {
                dynamicOffsets.add(offset);
            }
        }
        commandBuffer.bindDescriptorSet(0, this._context.descriptorSet, dynamicOffsets);

        const camera = scene.cameras[cameraIndex];
        for (const stage of this.stages) {
            if ((camera.visibilities & stage.visibilities) == 0) {
                continue;
            }

            let buffer_index = 0;
            buffer_index = stage.queue(buffer_pass, buffer_batch, buffer_index, commandBuffer, scene, cameraIndex);

            const renderPass = getRenderPass(stage.framebuffer.info, stage.clears ?? camera.clears);
            const rect = stage.rect ?? camera.rect;

            const { width, height } = stage.framebuffer.info;
            commandBuffer.beginRenderPass(renderPass, stage.framebuffer, width * rect[0], height * rect[1], width * rect[2], height * rect[3]);

            let material: DescriptorSet | undefined;
            let pipeline: Pipeline | undefined;
            for (let i = 0; i < buffer_index; i++) {
                const pass = buffer_pass[i];
                const batch = buffer_batch[i];
                if (pass.descriptorSet && material != pass.descriptorSet) {
                    commandBuffer.bindDescriptorSet(shaderLib.sets.material.index, pass.descriptorSet);
                    material = pass.descriptorSet;

                    profile.materials++;
                }

                if (batch.descriptorSet) {
                    commandBuffer.bindDescriptorSet(shaderLib.sets.batch.index, batch.descriptorSet);
                }

                const pl = this._context.getPipeline(pass.state, batch.inputAssembler.vertexInputState, renderPass, [pass.descriptorSetLayout, batch.descriptorSetLayout || descriptorSetLayoutNull]);
                if (pipeline != pl) {
                    commandBuffer.bindPipeline(pl);
                    pipeline = pl;

                    profile.pipelines++;
                }

                commandBuffer.bindInputAssembler(batch.inputAssembler);

                if (batch.inputAssembler.indexInput) {
                    commandBuffer.drawIndexed(batch.draw.count, batch.draw.first, batch.count);
                } else {
                    commandBuffer.draw(batch.draw.count, batch.draw.first, batch.count);
                }
                profile.draws++;
            }

            commandBuffer.endRenderPass();

            profile.stages++;
        }
    }
}