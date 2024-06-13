import { device } from "boot";
import { PeriodicFlag } from "./scene/PeriodicFlag.js";
const source2object = new WeakMap;
export class UniformResource {
    static cache(source) {
        let object = source2object.get(source);
        if (!object) {
            object = new UniformResource(source);
            source2object.set(source, object);
        }
        return object;
    }
    get descriptorSetLayout() {
        return this._source.getDescriptorSetLayout();
    }
    constructor(_source) {
        this._source = _source;
        this.descriptorSet = undefined;
        this._buffers = undefined;
        this._hasUpdated = new PeriodicFlag();
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
        if (this._hasUpdated.value) {
            return this;
        }
        if (this._buffers) {
            this._source.fillBuffers(this._buffers);
            for (const buffer of this._buffers) {
                buffer.update();
            }
        }
        if (this.descriptorSet) {
            (_b = (_a = this._source).bindTextures) === null || _b === void 0 ? void 0 : _b.call(_a, this.descriptorSet);
        }
        this._hasUpdated.clear(1);
        return this;
    }
}
