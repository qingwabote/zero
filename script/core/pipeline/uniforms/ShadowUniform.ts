import { BufferUsageFlagBits } from "../../gfx/Buffer.js";
import { DescriptorSetLayoutBinding, DescriptorType } from "../../gfx/DescriptorSetLayout.js";
import mat4 from "../../math/mat4.js";
import quat from "../../math/quat.js";
import vec3 from "../../math/vec3.js";
import shaders from "../../shaders.js";
import BufferView from "../buffers/BufferView.js";
import PipelineUniform from "../PipelineUniform.js";

const ShadowBlock = {
    type: DescriptorType.UNIFORM_BUFFER,
    binding: 2,
    uniforms: {
        view: {
            offset: 0
        },
        projection: {
            offset: 16
        }
    },
    size: (16 + 16) * Float32Array.BYTES_PER_ELEMENT,
}

const descriptorSetLayoutBinding = shaders.createDescriptorSetLayoutBinding(ShadowBlock);

export default class ShadowUniform implements PipelineUniform {
    get descriptorSetLayoutBinding(): DescriptorSetLayoutBinding {
        return descriptorSetLayoutBinding;
    }

    private _buffer!: BufferView;

    initialize(): void {
        const buffer = new BufferView("Float32", BufferUsageFlagBits.UNIFORM, ShadowBlock.size);
        zero.renderFlow.globalDescriptorSet.bindBuffer(ShadowBlock.binding, buffer.buffer);
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