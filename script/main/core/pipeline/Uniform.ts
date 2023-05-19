import { UniformDefinition } from "../ShaderLib.js";

export default interface Uniform {
    readonly definition: UniformDefinition;
    initialize(): void;
    update(): void;
}