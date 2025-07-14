import { CommandBuffer, DescriptorSet, DescriptorSetLayout, InputAssembler } from "gfx";
import { SubMesh } from "../scene/SubMesh.js";

interface ResourceBinding {
    readonly descriptorSetLayout: DescriptorSetLayout,
    readonly descriptorSet: DescriptorSet
}

export interface Batch {
    readonly inputAssembler: InputAssembler;
    readonly draw: Readonly<SubMesh.Draw>;
    readonly count: number;
    readonly instanced: ResourceBinding;
    readonly local?: ResourceBinding | undefined;

    upload(commandBuffer: CommandBuffer): void;
}

export declare namespace Batch {
    export { ResourceBinding }
}