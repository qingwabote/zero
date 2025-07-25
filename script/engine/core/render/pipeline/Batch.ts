import { CommandBuffer, DescriptorSet, DescriptorSetLayout, InputAssembler } from "gfx";
import { SubMesh } from "../scene/SubMesh.js";

interface ResourceBinding {
    readonly descriptorSetLayout: DescriptorSetLayout,
    readonly descriptorSet: DescriptorSet
}

export interface Batch {
    readonly inputAssembler: InputAssembler;
    readonly draw: Readonly<SubMesh.Draw>;

    readonly instance?: ResourceBinding | undefined;
    readonly local?: ResourceBinding | undefined;

    flush(commandBuffer: CommandBuffer): IterableIterator<[number, number]>;
}

export declare namespace Batch {
    export { ResourceBinding }
}