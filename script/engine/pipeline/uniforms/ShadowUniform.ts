import { device } from "boot";
import { Buffer, BufferUsageFlagBits, DescriptorType, ShaderStageFlagBits } from "gfx";
import { Zero } from "../../core/Zero.js";
import { mat4 } from "../../core/math/mat4.js";
import { quat } from "../../core/math/quat.js";
import { vec3 } from "../../core/math/vec3.js";
import { BufferView } from "../../core/render/BufferView.js";
import { UniformBufferObject } from "../../core/render/pipeline/UniformBufferObject.js";

const ShadowBlock = {
    type: DescriptorType.UNIFORM_BUFFER,
    stageFlags: ShaderStageFlagBits.VERTEX | ShaderStageFlagBits.FRAGMENT,
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

export class ShadowUniform extends UniformBufferObject {
    static readonly definition = ShadowBlock;

    private _orthoSize = 5;
    public get orthoSize() {
        return this._orthoSize;
    }
    public set orthoSize(value) {
        this._orthoSize = value;
        this._dirty = true;
    }

    aspect = 1;

    near = 1;

    far = 14;

    private _view: BufferView = new BufferView("Float32", BufferUsageFlagBits.UNIFORM, ShadowBlock.size);;
    get buffer(): Buffer {
        return this._view.buffer;
    }

    private _dirty = true;

    update(): void {
        const light = Zero.instance.scene.directionalLight!;

        if (this._dirty || light.hasChanged) {
            const view = vec3.normalize(vec3.create(), light.position);
            const rotation = quat.fromViewUp(quat.create(), view);
            const model = mat4.fromTRS(mat4.create(), rotation, light.position, vec3.create(1, 1, 1));
            this._view.set(mat4.invert(mat4.create(), model), ShadowBlock.members.view.offset);

            const halfH = this._orthoSize;
            const halfW = halfH * this.aspect;
            const lightProjection = mat4.ortho(mat4.create(), -halfW, halfW, -halfH, halfH, this.near, this.far, device.capabilities.clipSpaceMinZ);
            this._view.set(lightProjection, ShadowBlock.members.projection.offset);
            this._view.update();

            this._dirty = false;
        }
    }

}