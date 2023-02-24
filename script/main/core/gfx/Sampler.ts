// copy values from VkFilter in vulkan_core.h
export enum Filter {
    NEAREST = 0,
    LINEAR = 1
}

// copy values from VkSamplerAddressMode in vulkan_core.h
// export enum Address {
//     REPEAT = 0,
// }

export interface SamplerInfo {
    magFilter: Filter;
    minFilter: Filter;
}

export interface Sampler {
    initialize(info: SamplerInfo): boolean;
}