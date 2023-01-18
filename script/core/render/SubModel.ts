import InputAssembler from "../gfx/InputAssembler.js";
import Pass from "./Pass.js";

export default interface SubModel {
    inputAssemblers: InputAssembler[];
    passes: Pass[];
    vertexOrIndexCount: number;
}