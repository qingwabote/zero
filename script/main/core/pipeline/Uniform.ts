import { UniformDefinition } from "../programLib.js";

export default interface Uniform {
    readonly definition: UniformDefinition;
    initialize(): void;
    update(): void;
}