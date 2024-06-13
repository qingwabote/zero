import { UniformResource } from "../../core/render/UniformResource.js";
import { shaderLib } from "../../core/shaderLib.js";
export class RawDrawer {
    record(context, commandBuffer, renderPass, passType, models) {
        let draws = 0;
        for (const model of models) {
            commandBuffer.bindDescriptorSet(shaderLib.sets.local.index, UniformResource.cache(model).update().descriptorSet);
            for (let i = 0; i < model.mesh.subMeshes.length; i++) {
                const subMesh = model.mesh.subMeshes[i];
                const draw = subMesh.draw;
                if (!draw.count) {
                    continue;
                }
                const material = model.materials[i];
                for (const pass of material.passes) {
                    if (pass.type != passType) {
                        continue;
                    }
                    const descriptorSet = UniformResource.cache(pass).update().descriptorSet;
                    const layouts = [model.getDescriptorSetLayout()];
                    if (descriptorSet) {
                        commandBuffer.bindDescriptorSet(shaderLib.sets.material.index, descriptorSet);
                        layouts.push(pass.getDescriptorSetLayout());
                    }
                    const pipeline = context.getPipeline(pass.state, subMesh.inputAssembler, renderPass, layouts);
                    commandBuffer.bindPipeline(pipeline);
                    commandBuffer.bindInputAssembler(subMesh.inputAssembler);
                    if (subMesh.inputAssembler.indexInput) {
                        commandBuffer.drawIndexed(draw.count, draw.first, 1);
                    }
                    else {
                        commandBuffer.draw(draw.count, 1);
                    }
                    draws++;
                }
            }
        }
        return draws;
    }
}
