import PipelineUniform from "../PipelineUniform.js";
import RenderStage from "../RenderStage.js";
import CameraUniform from "../uniforms/CameraUniform.js";
import LightUniform from "../uniforms/LightUniform.js";

export default class ForwardStage extends RenderStage {
    getRequestedUniforms(): (new () => PipelineUniform)[] {
        return [LightUniform, CameraUniform];
    }
}