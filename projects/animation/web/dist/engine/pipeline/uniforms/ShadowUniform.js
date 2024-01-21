import { device } from "boot";
import { BufferUsageFlagBits, DescriptorType, ShaderStageFlagBits } from "gfx";
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
};
export class ShadowUniform extends UniformBufferObject {
    constructor() {
        super(...arguments);
        this._view = new BufferView("Float32", BufferUsageFlagBits.UNIFORM, ShadowBlock.size);
        this._dirty = true;
    }
    ;
    get buffer() {
        return this._view.buffer;
    }
    update() {
        const light = Zero.instance.scene.directionalLight;
        if (this._dirty || light.hasChanged) {
            const rotation = quat.rotationTo(quat.create(), vec3.FORWARD, vec3.normalize(vec3.create(), vec3.negate(vec3.create(), light.position)));
            const model = mat4.fromTRS(mat4.create(), rotation, light.position, vec3.create(1, 1, 1));
            this._view.set(mat4.invert(mat4.create(), model), ShadowBlock.members.view.offset);
            const camera = ShadowUniform.camera;
            const x = camera.orthoHeight * camera.aspect;
            const y = camera.orthoHeight;
            const lightProjection = mat4.ortho(mat4.create(), -x, x, -y, y, camera.near, camera.far, device.capabilities.clipSpaceMinZ);
            this._view.set(lightProjection, ShadowBlock.members.projection.offset);
            this._view.update();
            this._dirty = false;
        }
    }
}
ShadowUniform.camera = { orthoHeight: 6, aspect: 1, near: 1, far: 16 };
ShadowUniform.definition = ShadowBlock;
