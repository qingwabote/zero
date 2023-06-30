import { Sampler } from "./gfx/Sampler.js";
import { Filter } from "./gfx/info.js";

const hash2sampler: Map<number, Sampler> = new Map;

export default {
    get(minFilter = Filter.LINEAR, magFilter = Filter.LINEAR) {
        let hash = minFilter;
        hash |= (magFilter << 2);
        let sampler = hash2sampler.get(hash);
        if (!sampler) {
            const info = new gfx.SamplerInfo;
            info.minFilter = minFilter;
            info.magFilter = magFilter;
            sampler = device.createSampler();
            sampler.initialize(info);
            hash2sampler.set(hash, sampler);
        }
        return sampler;

    }
} as const;