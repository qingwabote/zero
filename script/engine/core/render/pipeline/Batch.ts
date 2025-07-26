import { CommandBuffer, DescriptorSet, DescriptorSetLayout } from "gfx";
import { Draw } from "../Draw.js";

interface ResourceBinding {
    readonly descriptorSetLayout: DescriptorSetLayout,
    readonly descriptorSet: DescriptorSet
}

export interface Batch {
    readonly draw: Draw;

    readonly instance?: ResourceBinding | undefined;
    readonly local?: ResourceBinding | undefined;

    flush(commandBuffer: CommandBuffer): IterableIterator<[number, number]>;
}

export declare namespace Batch {
    export { ResourceBinding }
}