import { Filter } from "./gfx/Sampler.js";

const sampler = gfx.createSampler();
sampler.initialize({ magFilter: Filter.LINEAR, minFilter: Filter.LINEAR });
export default {
    sampler
} as const;