import Device from "./Device.js";
import { FloatVector, ShaderInfo, StringVector } from "./info.js";

export default interface NS {
    readonly FloatVector: new () => FloatVector;
    readonly StringVector: new () => StringVector;

    readonly ShaderInfo: new () => ShaderInfo;

    readonly device: Device;
}