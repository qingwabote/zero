import { BufferUsageFlagBits, DescriptorType, ShaderStageFlagBits } from "gfx";
import { Zero } from "../../core/Zero.js";
import { BufferView } from "../../core/render/BufferView.js";
import { UBO } from "../../core/render/pipeline/UBO.js";
const Block = {
    type: DescriptorType.UNIFORM_BUFFER_DYNAMIC,
    stageFlags: ShaderStageFlagBits.VERTEX | ShaderStageFlagBits.FRAGMENT,
    members: {
        viewProj: {}
    }
};
const BlockSize = 16 * Float32Array.BYTES_PER_ELEMENT;
export class CSMUBO extends UBO {
    get buffer() {
        return this._view.buffer;
    }
    get range() {
        return BlockSize * this._num;
    }
    get dynamicOffset() {
        let index = -1;
        for (const camera of Zero.instance.scene.cameras) {
            if (camera.visibilities & this._data.shadow.visibilities) {
                index++;
                if (camera == this._data.current_camera) {
                    return UBO.align(this.range) * index;
                }
            }
        }
        return 0;
    }
    constructor(data, visibilities, _num) {
        super(data, visibilities);
        this._num = _num;
        this._view = new BufferView("Float32", BufferUsageFlagBits.UNIFORM);
    }
    update(dumping) {
        const size = UBO.align(this.range);
        let index = -1;
        for (const camera of Zero.instance.scene.cameras) {
            if (camera.visibilities & this._data.shadow.visibilities) {
                index++;
                const cascades = this._data.shadow.getCascades(camera);
                if (dumping || cascades.hasChanged) {
                    this._view.resize(size * (index + 1) / this._view.BYTES_PER_ELEMENT);
                    for (let j = 0; j < this._num; j++) {
                        this._view.set(cascades.viewProjs[j], (size / this._view.BYTES_PER_ELEMENT) * index + 16 * j);
                    }
                }
            }
        }
        this._view.update();
    }
}
CSMUBO.definition = Block;
