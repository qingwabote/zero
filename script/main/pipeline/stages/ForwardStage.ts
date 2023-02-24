import Stage from "../../core/pipeline/Stage.js";
import Uniform from "../../core/pipeline/Uniform.js";
import CameraUniform from "../uniforms/CameraUniform.js";
import LightUniform from "../uniforms/LightUniform.js";

export default class ForwardStage extends Stage {
    getRequestedUniforms(): (new () => Uniform)[] {
        return [LightUniform, CameraUniform];
    }
}