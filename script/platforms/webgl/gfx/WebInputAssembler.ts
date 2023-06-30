import InputAssembler from "../../../main/core/gfx/InputAssembler.js";
import { InputAssemblerInfo } from "../../../main/core/gfx/info.js";

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