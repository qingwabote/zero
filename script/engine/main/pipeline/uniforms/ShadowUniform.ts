import { BufferUsageFlagBits, DescriptorType, ShaderStageFlagBits } from "gfx";
import { Zero } from "../../core/Zero.js";
import { device } from "../../core/impl.js";
import { mat4 } from "../../core/math/mat4.js";
import { quat } from "../../core/math/quat.js";
import { vec3 } from "../../core/math/vec3.js";
import { Uniform } from "../../core/render/pipeline/Uniform.js";
import { BufferViewWritable } from "../../core/render/scene/buffers/BufferViewWritable.js";

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
} as const

export class ShadowUniform implements Uniform {
    static readonly camera = { orthoHeight: 6, aspect: 1, near: 1, far: 16 };

    readonly definition = ShadowBlock;

    private _buffer!: BufferViewWritable;

    initialize(): void {
        const buffer = new BufferViewWritable("Float32", BufferUsageFlagBits.UNIFORM, ShadowBlock.size);
        Zero.instance.flow.globalDescriptorSet.bindBuffer(ShadowBlock.binding, buffer.buffer);
        this._buffer = buffer;
    }

    update(): void {
        const renderScene = Zero.instance.scene;
        const light = renderScene.directionalLight!;

        if (light.hasChanged) {
            const rotation = quat.rotationTo(quat.create(), vec3.FORWARD, vec3.normalize(vec3.create(), vec3.negate(vec3.create(), light.position)));
            const model = mat4.fromTRS(mat4.create(), rotation, light.position, vec3.create(1, 1, 1));
            this._buffer.set(mat4.invert(mat4.create(), model), ShadowBlock.members.view.offset);

            const camera = ShadowUniform.camera;
            const x = camera.orthoHeight * camera.aspect;
            const y = camera.orthoHeight;
            const lightProjection = mat4.ortho(mat4.create(), -x, x, -y, y, camera.near, camera.far, device.capabilities.clipSpaceMinZ);
            this._buffer.set(lightProjection, ShadowBlock.members.projection.offset);
            this._buffer.update();
        }
    }

}