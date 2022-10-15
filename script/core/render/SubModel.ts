import { InputAssembler } from "../gfx/Pipeline.js";
import Pass from "./Pass.js";

export default interface SubModel {
    inputAssembler?: InputAssembler;
    passes: Pass[]
}