import DescriptorSet from "../../../main/core/gfx/DescriptorSet.js";
import DescriptorSetLayout, { DescriptorSetLayoutBinding } from "../../../main/core/gfx/DescriptorSetLayout.js";
import WebDescriptorSet from "./WebDescriptorSet.js";

export default class WebDescriptorSetLayout implements DescriptorSetLayout {
    private _bindings: DescriptorSetLayoutBinding[] = [];

    get bindings(): readonly DescriptorSetLayoutBinding[] {
        return this._bindings;
    }

    initialize(bindings: DescriptorSetLayoutBinding[]): boolean {
        this._bindings = bindings;
        return false;
    }

    createDescriptorSet(): DescriptorSet {
        return new WebDescriptorSet(this);
    }
}