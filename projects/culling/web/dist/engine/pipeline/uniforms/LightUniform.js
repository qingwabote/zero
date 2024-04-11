import { BufferUsageFlagBits, DescriptorType, ShaderStageFlagBits } from "gfx";
import { Zero } from "../../core/Zero.js";
import { vec3 } from "../../core/math/vec3.js";
import { BufferView } from "../../core/render/BufferView.js";
import { UniformBufferObject } from "../../core/render/pipeline/UniformBufferObject.js";
const LightBlock = {
    type: DescriptorType.UNIFORM_BUFFER,
    stageFlags: ShaderStageFlagBits.FRAGMENT,
    members: {
        direction: {}
    },
    size: 3 * Float32Array.BYTES_PER_ELEMENT
};
export class LightUniform extends UniformBufferObject {
    constructor() {
        super(...arguments);
        this._view = new BufferView("Float32", BufferUsageFlagBits.UNIFORM, LightBlock.size);
        this._dirty = true;
    }
    get buffer() {
        return this._view.buffer;
    }
    update() {
        const light = Zero.instance.scene.directionalLight;
        if (this._dirty || light.hasChanged) {
            const lightSrcDir = vec3.normalize(vec3.create(), light.position);
            this._view.set(lightSrcDir, 0);
            this._view.update();
            this._dirty = false;
        }
    }
}
LightUniform.definition = LightBlock;
