import { CommandBuffer, DescriptorSet } from "gfx";
import { Draw } from "../Draw.js";

export interface Batch {
    readonly draw: Draw;

    readonly instance?: DescriptorSet;
    readonly local?: DescriptorSet | undefined;

    flush(commandBuffer: CommandBuffer): IterableIterator<number>;
}