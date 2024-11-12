import { CommandBuffer, DescriptorSet } from "gfx";

export interface SkinStrategy {
    readonly descriptorSet: DescriptorSet

    readonly offset: number

    update(): void;

    upload(commandBuffer: CommandBuffer): void;
}