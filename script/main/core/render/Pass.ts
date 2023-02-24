import DescriptorSet from "../gfx/DescriptorSet.js";
import { PassState } from "../gfx/Pipeline.js";
import PassPhase from "./PassPhase.js";

export default class Pass {
    constructor(
        readonly state: PassState,
        readonly descriptorSet?: DescriptorSet,
        readonly phase: PassPhase = PassPhase.DEFAULT
    ) { }
}