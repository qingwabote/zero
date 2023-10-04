import { Buffer } from "./Buffer.js";
import { DescriptorSetLayout } from "./DescriptorSetLayout.js";
import { Sampler } from "./Sampler.js";
import { Texture } from "./Texture.js";

export declare class DescriptorSet {
    get layout(): DescriptorSetLayout;

    private constructor(...args);

    initialize(layout: DescriptorSetLayout): boolean;

    // getBuffer(binding: number): Buffer;
    bindBuffer(binding: number, buffer: Buffer, range?: number): void;
    // getTexture(binding: number): Texture;
    bindTexture(binding: number, texture: Texture, sampler: Sampler): void;
}