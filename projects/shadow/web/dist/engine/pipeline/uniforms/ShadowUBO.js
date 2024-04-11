import { device } from "boot";
import { BufferUsageFlagBits, DescriptorType, ShaderStageFlagBits } from "gfx";
import { Zero } from "../../core/Zero.js";
import { mat4 } from "../../core/math/mat4.js";
import { BufferView } from "../../core/render/BufferView.js";
import { UBO } from "../../core/render/pipeline/UBO.js";
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
};
const mat4_a = mat4.create();
export class ShadowUBO extends UBO {
    constructor() {
        super(...arguments);
        this._orthoSize = 5;
        this.aspect = 1;
        this.near = 1;
        this.far = 14;
        this._view = new BufferView("Float32", BufferUsageFlagBits.UNIFORM, ShadowBlock.size);
        this._dirty = true;
    }
    get orthoSize() {
        return this._orthoSize;
    }
    set orthoSize(value) {
        this._orthoSize = value;
        this._dirty = true;
    }
    ;
    get buffer() {
        return this._view.buffer;
    }
    update() {
        const light = Zero.instance.scene.directionalLight;
        if (this._dirty || light.hasChanged || light.transform.hasChanged) {
            this._view.set(mat4.invert(mat4_a, light.transform.world_matrix), ShadowBlock.members.view.offset);
            const halfH = this._orthoSize;
            const halfW = halfH * this.aspect;
            const lightProjection = mat4.ortho(mat4_a, -halfW, halfW, -halfH, halfH, this.near, this.far, device.capabilities.clipSpaceMinZ);
            this._view.set(lightProjection, ShadowBlock.members.projection.offset);
            this._view.update();
            this._dirty = false;
        }
    }
}
ShadowUBO.definition = ShadowBlock;
