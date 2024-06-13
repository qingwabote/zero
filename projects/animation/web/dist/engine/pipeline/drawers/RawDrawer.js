import { device } from "boot";
import { shaderLib } from "../../core/shaderLib.js";
class RenderObject {
    constructor(_source) {
        this._source = _source;
        const descriptorSetLayout = _source.getDescriptorSetLayout();
        if (descriptorSetLayout.info.bindings.size()) {
            const descriptorSet = device.createDescriptorSet(descriptorSetLayout);
            this.buffers = _source.createUniformBuffers(descriptorSet);
            this.descriptorSet = descriptorSet;
        }
    }
    update() {
        var _a, _b;
        if (this.buffers) {
            this._source.fillBuffers(this.buffers);
            for (const buffer of this.buffers) {
                buffer.update();
            }
        }
        if (this.descriptorSet) {
            (_b = (_a = this._source).bindTextures) === null || _b === void 0 ? void 0 : _b.call(_a, this.descriptorSet);
        }
    }
}
const getRenderObject = (function () {
    const source2object = new WeakMap;
    return function (source) {
        let object = source2object.get(source);
        if (!object) {
            object = new RenderObject(source);
            source2object.set(source, object);
        }
        return object;
    };
})();
export class RawDrawer {
    record(context, commandBuffer, renderPass, passType, models) {
        let draws = 0;
        for (const model of models) {
            const object = getRenderObject(model);
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
                    const obj = getRenderObject(pass);
                    obj.update();
                    const layouts = [model.getDescriptorSetLayout()];
                    if (obj.descriptorSet) {
                        commandBuffer.bindDescriptorSet(shaderLib.sets.material.index, obj.descriptorSet);
                        layouts.push(pass.getDescriptorSetLayout());
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
