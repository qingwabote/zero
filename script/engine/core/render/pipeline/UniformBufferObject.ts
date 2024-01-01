import { Buffer } from "gfx";
import { Uniform } from "../index.js";

export abstract class UniformBufferObject extends Uniform {
    abstract get buffer(): Buffer;
    get range(): number { return 0 };
    get dynamicOffset(): number { return -1 };
}