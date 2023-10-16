import { InputAssemblerInfo } from "./info.js";

/**
 * InputAssembler is an immutable object, it correspond to a vao in WebGL.
 */
export declare class InputAssembler {
    get info(): InputAssemblerInfo;
    private constructor(...args);
}