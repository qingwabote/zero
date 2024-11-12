import { CommandBuffer } from "gfx";
import { Skin } from "./Skin.js";
import { SkinStrategy } from "./SkinStrategy.js";

export class SkinBaked implements SkinStrategy {
    get descriptorSet() {
        return this._proto.baked.descriptorSet;
    }

    offset: number = 0;

    constructor(private readonly _proto: Skin) { }

    update(): void {
        throw new Error("Method not implemented.");
    }
    upload(commandBuffer: CommandBuffer): void {
        throw new Error("Method not implemented.");
    }
}