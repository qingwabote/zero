import { BufferUsageFlagBits, DescriptorType, ShaderStageFlagBits } from "gfx";
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
    constructor(data, visibilities, _num) {
        super(data, visibilities);
        this._num = _num;
        this._view = new BufferView("Float32", BufferUsageFlagBits.UNIFORM);
    }
    dynamicOffset(params) {
        const index = this._data.shadow.visibleCameras.findIndex(cameraIndex => cameraIndex == params.cameraIndex);
        if (index == -1) {
            return 0;
        }
        return UBO.align(this.range) * index;
    }
    update(dumping) {
        const size = UBO.align(this.range);
        const shadow = this._data.shadow;
        this._view.resize(size * shadow.visibleCameras.length / this._view.BYTES_PER_ELEMENT);
        for (let i = 0; i < shadow.visibleCameras.length; i++) {
            const offset = (size / this._view.BYTES_PER_ELEMENT) * i;
            const cascades = shadow.cascades.get(shadow.visibleCameras[i]);
            if (dumping || cascades.hasChanged) {
                for (let j = 0; j < this._num; j++) {
                    this._view.set(cascades.viewProjs[j], offset + 16 * j);
                }
            }
        }
        this._view.update();
    }
}
CSMUBO.definition = Block;
