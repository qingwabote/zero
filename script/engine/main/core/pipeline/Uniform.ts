import { UniformDefinition } from "../shaderLib.js";

export interface Uniform {
    readonly definition: UniformDefinition;
    initialize(): void;
    update(): void;
}