import { PeriodicFlag } from "./PeriodicFlag.js";
export class InstanceBatch {
    get count() {
        return this._count;
    }
    get locked() {
        return this._lockedFlag.value != 0;
    }
    constructor(inputAssembler, draw, vertex, descriptorSetLayout, descriptorSet, uniforms) {
        this.inputAssembler = inputAssembler;
        this.draw = draw;
        this.vertex = vertex;
        this.descriptorSetLayout = descriptorSetLayout;
        this.descriptorSet = descriptorSet;
        this.uniforms = uniforms;
        this._count = 0;
        this._lockedFlag = new PeriodicFlag();
    }
    next() {
        this._count++;
    }
    upload(commandBuffer) {
        this.vertex.update(commandBuffer);
        for (const key in this.uniforms) {
            this.uniforms[key].update(commandBuffer);
        }
        this._lockedFlag.reset(1);
    }
    recycle() {
        this._count = 0;
    }
}
