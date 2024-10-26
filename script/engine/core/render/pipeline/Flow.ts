import { device } from "boot";
import { DescriptorSet, DescriptorSetLayoutInfo, Pipeline, Uint32Vector } from "gfx";
import { shaderLib } from "../../shaderLib.js";
import { Context } from "../Context.js";
import { Pass } from "../scene/Pass.js";
import { Batch } from "./Batch.js";
import { FlowContext } from "./FlowContext.js";
import { getRenderPass } from "./rpc.js";
import { Stage } from "./Stage.js";
import { UBO } from "./UBO.js";

const descriptorSetLayoutNull = device.createDescriptorSetLayout(new DescriptorSetLayoutInfo);

const buffer_pass: Pass[] = [];
const buffer_batch: Batch[] = [];

export class Flow {
    constructor(
        private readonly _context: FlowContext,
        private readonly _ubos: readonly UBO[],
        public readonly stages: readonly Stage[],
        public readonly visibilities: number,
        private readonly _flowLoopIndex: number,
    ) { }

    record(context: Context, cameraIndex: number) {
        const dynamicOffsets = new Uint32Vector;
        for (const uniform of this._ubos) {
            const offset = uniform.dynamicOffset(context, cameraIndex, this._flowLoopIndex);
            if (offset != -1) {
                dynamicOffsets.add(offset);
            }
        }
        context.commandBuffer.bindDescriptorSet(0, this._context.descriptorSet, dynamicOffsets);

        const camera = context.scene.cameras[cameraIndex];
        for (const stage of this.stages) {
            if ((camera.visibilities & stage.visibilities) == 0) {
                continue;
            }

            let buffer_index = 0;
            buffer_index = stage.queue(buffer_pass, buffer_batch, buffer_index, context, cameraIndex);

            const renderPass = getRenderPass(stage.framebuffer.info, stage.clears ?? camera.clears);
            const rect = stage.rect ?? camera.rect;

            const { width, height } = stage.framebuffer.info;
            context.commandBuffer.beginRenderPass(renderPass, stage.framebuffer, width * rect[0], height * rect[1], width * rect[2], height * rect[3]);

            let material: DescriptorSet | undefined;
            let pipeline: Pipeline | undefined;
            for (let i = 0; i < buffer_index; i++) {
                const pass = buffer_pass[i];
                const batch = buffer_batch[i];
                if (pass.descriptorSet && material != pass.descriptorSet) {
                    context.commandBuffer.bindDescriptorSet(shaderLib.sets.material.index, pass.descriptorSet);
                    material = pass.descriptorSet;

                    context.profile.materials++;
                }

                if (batch.descriptorSet) {
                    context.commandBuffer.bindDescriptorSet(shaderLib.sets.batch.index, batch.descriptorSet);
                }

                const pl = this._context.getPipeline(pass.state, batch.inputAssembler.vertexInputState, renderPass, [pass.descriptorSetLayout, batch.descriptorSetLayout || descriptorSetLayoutNull]);
                if (pipeline != pl) {
                    context.commandBuffer.bindPipeline(pl);
                    pipeline = pl;

                    context.profile.pipelines++;
                }

                context.commandBuffer.bindInputAssembler(batch.inputAssembler);

                if (batch.inputAssembler.indexInput) {
                    context.commandBuffer.drawIndexed(batch.draw.count, batch.draw.first, batch.count);
                } else {
                    context.commandBuffer.draw(batch.draw.count, batch.draw.first, batch.count);
                }
                context.profile.draws++;
            }

            context.commandBuffer.endRenderPass();

            context.profile.stages++;
        }
    }
}