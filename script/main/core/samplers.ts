import { Filter, Sampler, SamplerInfo } from "./gfx/Sampler.js";

const hash2sampler: Map<number, Sampler> = new Map;

export default {
    get(info: SamplerInfo = { minFilter: Filter.LINEAR, magFilter: Filter.LINEAR }) {
        let hash = info.minFilter;
        hash |= (info.magFilter << 2);
        let sampler = hash2sampler.get(hash);
        if (!sampler) {
            sampler = gfx.createSampler();
            sampler.initialize(info);
            hash2sampler.set(hash, sampler);
        }
        return sampler;

    }
} as const;