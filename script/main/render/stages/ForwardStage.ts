import Phase from "../../core/render/Phase.js";
import Stage from "../../core/render/Stage.js";
import Uniform from "../../core/render/Uniform.js";
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