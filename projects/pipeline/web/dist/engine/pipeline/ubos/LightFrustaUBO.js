import { BufferUsageFlagBits, DescriptorType, ShaderStageFlagBits } from "gfx";
import { Zero } from "../../core/Zero.js";
import { BufferView } from "../../core/render/BufferView.js";
import { UBO } from "../../core/render/pipeline/UBO.js";
const Block = {
    type: DescriptorType.UNIFORM_BUFFER_DYNAMIC,
    stageFlags: ShaderStageFlagBits.VERTEX | ShaderStageFlagBits.FRAGMENT,
    members: {
        viewProj: {
            offset: 0
        }
    },
    size: UBO.align((16 * 3 + 1) * Float32Array.BYTES_PER_ELEMENT),
};
export class LightFrustaUBO extends UBO {
    constructor() {
        super(...arguments);
        this._view = new BufferView("Float32", BufferUsageFlagBits.UNIFORM);
    }
    get buffer() {
        return this._view.buffer;
    }
    get range() {
        return Block.size;
    }
    dynamicOffset(params) {
        const light = Zero.instance.scene.directionalLight;
        return Block.size * light.shadows[params.cameraIndex].index;
    }
    update() {
        const light = Zero.instance.scene.directionalLight;
        this._view.resize(Block.size * light.shadow_cameras.length / this._view.source.BYTES_PER_ELEMENT);
        for (let i = 0; i < light.shadow_cameras.length; i++) {
            const shadow = light.shadows[light.shadow_cameras[i]];
            if (shadow.hasChanged) {
                const offset = (Block.size / this._view.source.BYTES_PER_ELEMENT) * i;
                this._view.set(shadow.viewProj, offset + Block.members.viewProj.offset);
            }
        }
        this._view.update();
    }
}
LightFrustaUBO.definition = Block;
