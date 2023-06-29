import Device from "../../../main/core/gfx/Device.js";
import NS from "../../../main/core/gfx/NS.js";
import WebDevice from "./WebDevice.js";
import { WebShaderInfo, WebVector } from "./info.js";

export default class WebNS implements NS {
    StringVector = WebVector;
    FloatVector = WebVector;
    ShaderInfo = WebShaderInfo;

    device: Device;

    constructor(canvas: HTMLCanvasElement) {
        this.device = new WebDevice(canvas);
    }
}