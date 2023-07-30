import { InputAssemblerInfo } from "./info.js";

/**
 * InputAssembler is an immutable object, it correspond to a vao in WebGL.
 */
export interface InputAssembler {
    get info(): InputAssemblerInfo;
    initialize(info: InputAssemblerInfo): boolean;
}