import { device } from "boot";
import { Buffer, DescriptorType, ShaderStageFlagBits } from "gfx";
import { Parameters } from "./Parameters.js";

interface UBODefinition {
    type: DescriptorType;
    stageFlags: ShaderStageFlagBits;
}

export abstract class UBO {
    static readonly definition: UBODefinition;

    static align(size: number) {
        const alignment = device.capabilities.uniformBufferOffsetAlignment;
        return Math.ceil(size / alignment) * alignment;
    }

    private _visibilities: number = 0;
    get visibilities(): number {
        return this._visibilities;
    }
    set visibilities(value: number) {
        this._visibilities = value;
    }

    abstract get buffer(): Buffer;

    get range(): number { return 0 };

    dynamicOffset(paramm: Parameters): number { return -1 };

    use(): void { };

    update(): void { };
}