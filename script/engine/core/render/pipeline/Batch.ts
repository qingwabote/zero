import { CommandBuffer, DescriptorSet } from "gfx";
import { Draw } from "../Draw.js";

export interface Batch {
    readonly draw: Draw;

    readonly instance: DescriptorSet | null;
    readonly local: DescriptorSet | null;

    flush(commandBuffer: CommandBuffer): IterableIterator<[number, number]>;
}