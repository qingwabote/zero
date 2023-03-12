import { BufferUsageFlagBits } from "../../core/gfx/Buffer.js";
import { DescriptorSetLayoutBinding, DescriptorType } from "../../core/gfx/DescriptorSetLayout.js";
import mat4 from "../../core/math/mat4.js";
import quat from "../../core/math/quat.js";
import vec3 from "../../core/math/vec3.js";
import Uniform from "../../core/render/Uniform.js";
import BufferView from "../../core/scene/buffers/BufferView.js";
import ShaderLib from "../../core/ShaderLib.js";

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

const descriptorSetLayoutBinding = ShaderLib.createDescriptorSetLayoutBinding(ShadowBlock);

export default class ShadowUniform implements Uniform {
    get descriptorSetLayoutBinding(): DescriptorSetLayoutBinding {
        return descriptorSetLayoutBinding;
    }

    private _buffer!: BufferView;

    initialize(): void {
        const buffer = new BufferView("Float32", BufferUsageFlagBits.UNIFORM, ShadowBlock.size);
        zero.flow.globalDescriptorSet.bindBuffer(ShadowBlock.binding, buffer.buffer);
        this._buffer = buffer;
    }

    update(): void {
        const renderScene = zero.scene;
        const light = renderScene.directionalLight!;

        if (light.hasChanged) {
            const rotation = quat.rotationTo(quat.create(), vec3.FORWARD, vec3.normalize(vec3.create(), vec3.negate(vec3.create(), light.position)));
            const model = mat4.fromRTS(mat4.create(), rotation, light.position, vec3.create(1, 1, 1));
            this._buffer.set(mat4.invert(mat4.create(), model), ShadowBlock.uniforms.view.offset);
            const lightProjection = mat4.ortho(mat4.create(), -4, 4, -4, 4, 1, 10, gfx.capabilities.clipSpaceMinZ);
            this._buffer.set(lightProjection, ShadowBlock.uniforms.projection.offset);
            this._buffer.update();
        }
    }

}