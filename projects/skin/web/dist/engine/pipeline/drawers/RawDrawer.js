import { device } from "boot";
import { shaderLib } from "../../core/shaderLib.js";
class RenderObject {
    constructor(_model) {
        this._model = _model;
        let modelLayout = RenderObject._modelType2layout.get(_model.constructor);
        if (!modelLayout) {
            modelLayout = _model.constructor.createDescriptorSetLayout();
            RenderObject._modelType2layout.set(_model.constructor, modelLayout);
        }
        const descriptorSet = device.createDescriptorSet(modelLayout);
        this.buffers = _model.constructor.createUniformBuffers(descriptorSet);
        this.descriptorSet = descriptorSet;
        this.descriptorSetLayout = modelLayout;
    }
    update() {
        this._model.uploadBuffers(this.buffers);
        for (const buffer of this.buffers) {
            buffer.update();
        }
    }
}
RenderObject._modelType2layout = new WeakMap;
const model2object = new WeakMap;
export class RawDrawer {
    record(context, commandBuffer, renderPass, passType, models) {
        let draws = 0;
        for (const model of models) {
            let object = model2object.get(model);
            if (!object) {
                object = new RenderObject(model);
                model2object.set(model, object);
            }
            object.update();
            commandBuffer.bindDescriptorSet(shaderLib.sets.local.index, object.descriptorSet);
            for (let i = 0; i < model.mesh.subMeshes.length; i++) {
                const subMesh = model.mesh.subMeshes[i];
                const drawInfo = subMesh.drawInfo;
                if (!drawInfo.count) {
                    continue;
                }
                const material = model.materials[i];
                for (const pass of material.passes) {
                    if (pass.type != passType) {
                        continue;
                    }
                    pass.update();
                    const layouts = [object.descriptorSetLayout];
                    if (pass.descriptorSet) {
                        commandBuffer.bindDescriptorSet(shaderLib.sets.material.index, pass.descriptorSet);
                        layouts.push(pass.descriptorSetLayout);
                    }
                    const pipeline = context.getPipeline(pass.state, subMesh.inputAssembler, renderPass, layouts);
                    commandBuffer.bindPipeline(pipeline);
                    commandBuffer.bindInputAssembler(subMesh.inputAssembler);
                    if (subMesh.inputAssembler.indexInput) {
                        commandBuffer.drawIndexed(drawInfo.count, drawInfo.first);
                    }
                    else {
                        commandBuffer.draw(drawInfo.count);
                    }
                    draws++;
                }
            }
        }
        return draws;
    }
}
