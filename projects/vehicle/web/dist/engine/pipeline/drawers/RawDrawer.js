import { device } from "boot";
import { shaderLib } from "../../core/shaderLib.js";
class UniformObject {
    constructor(_source) {
        this._source = _source;
        this.descriptorSet = undefined;
        this._buffers = undefined;
        const descriptorSetLayout = _source.getDescriptorSetLayout();
        if (descriptorSetLayout) {
            const descriptorSet = device.createDescriptorSet(descriptorSetLayout);
            const buffers = _source.createUniformBuffers(descriptorSet);
            if (buffers.length) {
                this._buffers = buffers;
            }
            this.descriptorSet = descriptorSet;
        }
    }
    update() {
        var _a, _b;
        if (this._buffers) {
            this._source.fillBuffers(this._buffers);
            for (const buffer of this._buffers) {
                buffer.update();
            }
        }
        if (this.descriptorSet) {
            (_b = (_a = this._source).bindTextures) === null || _b === void 0 ? void 0 : _b.call(_a, this.descriptorSet);
        }
    }
}
const syncUniformObject = (function () {
    const source2object = new WeakMap;
    return function (source) {
        let object = source2object.get(source);
        if (!object) {
            object = new UniformObject(source);
            source2object.set(source, object);
        }
        object.update();
        return object;
    };
})();
export class RawDrawer {
    record(context, commandBuffer, renderPass, passType, models) {
        let draws = 0;
        for (const model of models) {
            commandBuffer.bindDescriptorSet(shaderLib.sets.local.index, syncUniformObject(model).descriptorSet);
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
                    const descriptorSet = syncUniformObject(pass).descriptorSet;
                    const layouts = [model.getDescriptorSetLayout()];
                    if (descriptorSet) {
                        commandBuffer.bindDescriptorSet(shaderLib.sets.material.index, descriptorSet);
                        layouts.push(pass.getDescriptorSetLayout());
                    }
                    const pipeline = context.getPipeline(pass.state, subMesh.inputAssembler, renderPass, layouts);
                    commandBuffer.bindPipeline(pipeline);
                    commandBuffer.bindInputAssembler(subMesh.inputAssembler);
                    if (subMesh.inputAssembler.indexInput) {
                        commandBuffer.drawIndexed(draw.count, draw.first);
                    }
                    else {
                        commandBuffer.draw(draw.count);
                    }
                    draws++;
                }
            }
        }
        return draws;
    }
}
