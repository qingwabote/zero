import { SamplerInfo } from "./info.js";

export interface Sampler {
    initialize(info: SamplerInfo): boolean;
}