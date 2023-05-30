import { UniformDefinition } from "../shaderLib.js";

export default interface Uniform {
    readonly definition: UniformDefinition;
    initialize(): void;
    update(): void;
}