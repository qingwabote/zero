import { CullMode } from "../gfx/Pipeline.js";
import { PhaseBit } from "./RenderPhase.js";
export default class Pass {
    _descriptorSet;
    get descriptorSet() {
        return this._descriptorSet;
    }
    _shader;
    get shader() {
        return this._shader;
    }
    _rasterizationState;
    get rasterizationState() {
        return this._rasterizationState;
    }
    _phase;
    get phase() {
        return this._phase;
    }
    _hash;
    get hash() {
        return this._hash;
    }
    constructor(descriptorSet, shader, rasterizationState = { cullMode: CullMode.BACK, hash: CullMode.BACK.toString() }, phase = PhaseBit.DEFAULT) {
        this._descriptorSet = descriptorSet;
        this._hash = shader.info.hash + rasterizationState.hash;
        this._shader = shader;
        this._rasterizationState = rasterizationState;
        this._phase = phase;
    }
}
//# sourceMappingURL=Pass.js.map