import Phase from "../../core/pipeline/Phase.js";
import Stage from "../../core/pipeline/Stage.js";
import Uniform from "../../core/pipeline/Uniform.js";
import CameraUniform from "../uniforms/CameraUniform.js";
import LightUniform from "../uniforms/LightUniform.js";

export default class ForwardStage extends Stage {
    private readonly _unlit: boolean;

    constructor(phases: Phase[], unlit: boolean = false) {
        super(phases);
        this._unlit = unlit;
    }
    getRequestedUniforms(): (new () => Uniform)[] {
        return this._unlit ? [CameraUniform] : [LightUniform, CameraUniform];
    }
}