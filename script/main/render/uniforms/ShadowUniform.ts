import { BufferUsageFlagBits } from "../../core/gfx/Buffer.js";
import { DescriptorSetLayoutBinding, DescriptorType } from "../../core/gfx/DescriptorSetLayout.js";
import { ShaderStageFlagBits } from "../../core/gfx/Shader.js";
import mat4 from "../../core/math/mat4.js";
import quat from "../../core/math/quat.js";
import vec3 from "../../core/math/vec3.js";
import Uniform from "../../core/render/Uniform.js";
import BufferView from "../../core/scene/buffers/BufferView.js";
import ShaderLib from "../../core/ShaderLib.js";

const ShadowBlock = {
    type: DescriptorType.UNIFORM_BUFFER,
    stageFlags: ShaderStageFlagBits.VERTEX | ShaderStageFlagBits.FRAGMENT,
    binding: 2,
    members: {
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
    static readonly camera = { orthoHeight: 6, aspect: 1, near: 1, far: 16 };

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
            const model = mat4.fromTRS(mat4.create(), rotation, light.position, vec3.create(1, 1, 1));
            this._buffer.set(mat4.invert(mat4.create(), model), ShadowBlock.members.view.offset);

            const camera = ShadowUniform.camera;
            const x = camera.orthoHeight * camera.aspect;
            const y = camera.orthoHeight;
            const lightProjection = mat4.ortho(mat4.create(), -x, x, -y, y, camera.near, camera.far, gfx.capabilities.clipSpaceMinZ);
            this._buffer.set(lightProjection, ShadowBlock.members.projection.offset);
            this._buffer.update();
        }
    }

}