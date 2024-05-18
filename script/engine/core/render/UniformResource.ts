import { device } from "boot";
import { DescriptorSet, DescriptorSetLayout } from "gfx";
import { BufferView } from "./BufferView.js";
import { UniformSource } from "./UniformSource.js";
import { ChangeRecord } from "./scene/ChangeRecord.js";

const source2object: WeakMap<UniformSource, UniformResource> = new WeakMap;

export class UniformResource extends ChangeRecord {
    static cache(source: UniformSource) {
        let object = source2object.get(source);
        if (!object) {
            object = new UniformResource(source);
            source2object.set(source, object);
        }
        return object;
    }

    get descriptorSetLayout(): DescriptorSetLayout | null {
        return this._source.getDescriptorSetLayout()
    }

    readonly descriptorSet?: DescriptorSet = undefined;

    private readonly _buffers?: BufferView[] = undefined;

    constructor(private _source: UniformSource) {
        super();
        const descriptorSetLayout = _source.getDescriptorSetLayout();
        if (descriptorSetLayout) {
            const descriptorSet = device.createDescriptorSet(descriptorSetLayout);
            const buffers = _source.createUniformBuffers(descriptorSet);
            if (buffers.length) {
                this._buffers = buffers;
            }
            this.descriptorSet = descriptorSet;
        }
    }

    update() {
        if (this.hasChanged) {
            return this;
        }

        if (this._buffers) {
            this._source.fillBuffers(this._buffers);
            for (const buffer of this._buffers) {
                buffer.update();
            }
        }

        if (this.descriptorSet) {
            this._source.bindTextures?.(this.descriptorSet);
        }

        this.hasChanged = 1;

        return this
    }
}