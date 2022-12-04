import { BufferUsageFlagBits } from "../../gfx/Buffer.js";
import DescriptorSet from "../../gfx/DescriptorSet.js";
import mat4 from "../../math/mat4.js";
import quat from "../../math/quat.js";
import vec3 from "../../math/vec3.js";
import shaders from "../../shaders.js";
import BufferView from "../buffers/BufferView.js";
import PipelineUniform from "../PipelineUniform.js";

const ShadowBlock = shaders.sets.global.uniforms.Shadow;

export default class ShadowUniform implements PipelineUniform {
    private _buffer: BufferView;

    constructor(globalDescriptorSet: DescriptorSet) {
        const buffer = new BufferView("Float32", BufferUsageFlagBits.UNIFORM, ShadowBlock.size);
        globalDescriptorSet.bindBuffer(ShadowBlock.binding, buffer.buffer);
        this._buffer = buffer;
    }

    update(): void {
        const renderScene = zero.renderScene;
        const dirtyObjects = renderScene.dirtyObjects;
        const directionalLight = renderScene.directionalLight;

        if (dirtyObjects.has(directionalLight) || dirtyObjects.has(directionalLight.node)) {
            const lightPos = directionalLight.node.position;
            // const rotation = quat.fromMat3(quat.create(), mat3.fromViewUp(mat3.create(), vec3.normalize(vec3.create(), lightPos)));
            const rotation = quat.rotationTo(quat.create(), vec3.create(0, 0, -1), vec3.normalize(vec3.create(), vec3.negate(vec3.create(), lightPos)));
            const model = mat4.fromRTS(mat4.create(), rotation, lightPos, vec3.create(1, 1, 1));
            this._buffer.set(mat4.invert(mat4.create(), model), ShadowBlock.uniforms.view.offset);
            const lightProjection = mat4.ortho(mat4.create(), -4, 4, -4, 4, 1, 10, gfx.capabilities.clipSpaceMinZ);
            this._buffer.set(lightProjection, ShadowBlock.uniforms.projection.offset);
            this._buffer.update();
        }
    }

}