import { DescriptorSet, DescriptorSetLayout, InputAssembler } from "gfx";
import { SubMesh } from "../scene/SubMesh.js";

export interface Batch {
    readonly inputAssembler: InputAssembler;
    readonly draw: Readonly<SubMesh.Draw>;
    readonly count: number;
    readonly descriptorSetLayout?: DescriptorSetLayout | undefined;
    readonly descriptorSet?: DescriptorSet | undefined;
}