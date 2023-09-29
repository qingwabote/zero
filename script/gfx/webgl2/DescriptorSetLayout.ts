import { DescriptorSetLayoutInfo } from "./info.js";

export class DescriptorSetLayout {
    private _info!: DescriptorSetLayoutInfo;

    get info(): DescriptorSetLayoutInfo {
        return this._info;
    }

    initialize(info: DescriptorSetLayoutInfo): boolean {
        this._info = info;
        return false;
    }
}