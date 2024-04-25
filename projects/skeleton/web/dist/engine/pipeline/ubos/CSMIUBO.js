import { BufferUsageFlagBits, DescriptorType, ShaderStageFlagBits } from "gfx";
import { BufferView } from "../../core/render/BufferView.js";
import { Shadow } from "../../core/render/pipeline/Shadow.js";
import { UBO } from "../../core/render/pipeline/UBO.js";
const Block = {
    type: DescriptorType.UNIFORM_BUFFER_DYNAMIC,
    stageFlags: ShaderStageFlagBits.VERTEX | ShaderStageFlagBits.FRAGMENT,
    members: {
        viewProj: {}
    }
};
const BlockSize = 16 * Float32Array.BYTES_PER_ELEMENT;
/**CSM iterator UBO */
export class CSMIUBO extends UBO {
    get buffer() {
        return this._view.buffer;
    }
    get range() {
        return BlockSize;
    }
    constructor(data, visibilities, _num) {
        super(data, visibilities);
        this._num = _num;
        this._view = new BufferView("Float32", BufferUsageFlagBits.UNIFORM);
        data.shadow = new Shadow(visibilities, _num);
    }
    dynamicOffset(params) {
        const index = this._data.shadow.visibleCameras.findIndex(cameraIndex => cameraIndex == params.cameraIndex);
        const offset = UBO.align(BlockSize) * (this._num * index + this._data.flowLoopIndex);
        return offset;
    }
    update(dumping) {
        const size = UBO.align(BlockSize);
        const shadow = this._data.shadow;
        this._view.resize(size * this._num * shadow.visibleCameras.length / this._view.BYTES_PER_ELEMENT);
        for (let i = 0; i < shadow.visibleCameras.length; i++) {
            const cascades = shadow.cascades.get(shadow.visibleCameras[i]);
            if (dumping || cascades.hasChanged) {
                for (let j = 0; j < this._num; j++) {
                    this._view.set(cascades.viewProjs[j], (size / this._view.BYTES_PER_ELEMENT) * (this._num * i + j));
                }
            }
        }
        this._view.update();
    }
}
CSMIUBO.definition = Block;
