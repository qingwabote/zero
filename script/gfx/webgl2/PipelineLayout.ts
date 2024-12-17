import { PipelineLayoutInfo } from "./info";
import { DescriptorType } from "./shared/constants.js";

export class PipelineLayout {
    readonly _flatBindings: Record<number, number>;

    constructor(readonly info: PipelineLayoutInfo) {
        const flatBindings: Record<number, number> = {};
        let textureBinding = 0;
        let blockBinding = 0;
        for (let set = 0; set < info.layouts.data.length; set++) {
            for (const dslb of info.layouts.data[set].info.bindings.data) {
                switch (dslb.descriptorType) {
                    case DescriptorType.SAMPLER_TEXTURE:
                        flatBindings[set * 100 + dslb.binding] = textureBinding++;
                        break;
                    case DescriptorType.UNIFORM_BUFFER:
                    case DescriptorType.UNIFORM_BUFFER_DYNAMIC:
                        flatBindings[set * 100 + dslb.binding] = blockBinding++;
                        break;
                    default:
                        throw new Error(`unsupported descriptorType: ${dslb.descriptorType}`);
                }
            }
        }
        this._flatBindings = flatBindings;
    }

    getFlatBinding(set: number, binding: number): number {
        return this._flatBindings[set * 100 + binding];
    }
}