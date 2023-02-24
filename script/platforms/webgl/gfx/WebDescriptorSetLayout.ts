import DescriptorSetLayout, { DescriptorSetLayoutBinding } from "../../../main/core/gfx/DescriptorSetLayout.js";

export default class WebDescriptorSetLayout implements DescriptorSetLayout {
    private _bindings: DescriptorSetLayoutBinding[] = [];

    get bindings(): readonly DescriptorSetLayoutBinding[] {
        return this._bindings;
    }

    initialize(bindings: DescriptorSetLayoutBinding[]): boolean {
        this._bindings = bindings;
        return false;
    }

}