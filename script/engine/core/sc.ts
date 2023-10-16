import { device } from "boot";
import { Filter, Sampler, SamplerInfo } from "gfx";

const hash2sampler: Map<number, Sampler> = new Map;

export function getSampler(minFilter = Filter.LINEAR, magFilter = Filter.LINEAR) {
    let hash = minFilter;
    hash |= (magFilter << 2);
    let sampler = hash2sampler.get(hash);
    if (!sampler) {
        const info = new SamplerInfo;
        info.minFilter = minFilter;
        info.magFilter = magFilter;
        sampler = device.createSampler(info);
        hash2sampler.set(hash, sampler);
    }
    return sampler;

}