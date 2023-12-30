import { UniformDefinition } from "../../shaderLib.js";
import { Flow } from "./Flow.js";

export interface Uniform {
    readonly definition: UniformDefinition;
    initialize(flow: Flow): void;
    update(): void;
}