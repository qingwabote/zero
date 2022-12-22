import InputAssembler, { InputAssemblerInfo } from "../../../core/gfx/InputAssembler.js";

export default class WebInputAssembler implements InputAssembler {
    private _info!: InputAssemblerInfo;
    get info(): InputAssemblerInfo {
        return this._info;
    }

    initialize(info: InputAssemblerInfo): boolean {
        this._info = info;
        return false;
    }
}