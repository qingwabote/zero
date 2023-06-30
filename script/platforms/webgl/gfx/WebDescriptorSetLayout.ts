import DescriptorSetLayout from "../../../main/core/gfx/DescriptorSetLayout.js";
import { DescriptorSetLayoutInfo } from "../../../main/core/gfx/info.js";

export default class WebDescriptorSetLayout implements DescriptorSetLayout {
    private _info!: DescriptorSetLayoutInfo;

    get info(): DescriptorSetLayoutInfo {
        return this._info;
    }

    initialize(info: DescriptorSetLayoutInfo): boolean {
        this._info = info;
        return false;
    }
}