import { DescriptorSet_ReadOnly } from "../gfx/DescriptorSet.js";
import { PassState } from "../gfx/Pipeline.js";
import PassPhase from "./PassPhase.js";

export default interface Pass {
    get state(): PassState;
    get descriptorSet(): DescriptorSet_ReadOnly | undefined;
    get phase(): PassPhase;
}