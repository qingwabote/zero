import { DescriptorSet_ReadOnly } from "./core/gfx/DescriptorSet.js";
import { PassState } from "./core/gfx/Pipeline.js";
import Pass from "./core/render/Pass.js";
import PassPhase from "./core/render/PassPhase.js";

export default class PassInstance implements Pass {
    get state(): PassState {
        return this._proto.state;
    }
    get descriptorSet(): DescriptorSet_ReadOnly | undefined {
        return this._proto.descriptorSet;
    }
    get phase(): PassPhase {
        return this._proto.phase;
    }

    constructor(private _proto: Pass) {

    }
}