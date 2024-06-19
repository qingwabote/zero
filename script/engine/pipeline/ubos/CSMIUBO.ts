import { Buffer, BufferUsageFlagBits, DescriptorType, ShaderStageFlagBits } from "gfx";
import { Zero } from "../../core/Zero.js";
import { BufferView } from "../../core/render/BufferView.js";
import { Data } from "../../core/render/pipeline/Data.js";
import { UBO } from "../../core/render/pipeline/UBO.js";

const Block = {
    type: DescriptorType.UNIFORM_BUFFER_DYNAMIC,
    stageFlags: ShaderStageFlagBits.VERTEX | ShaderStageFlagBits.FRAGMENT,
    members: {
        viewProj: {}
    }
}

const BlockSize = 16 * Float32Array.BYTES_PER_ELEMENT;

/**CSM iterator UBO */
export class CSMIUBO extends UBO {

    static readonly definition = Block;

    private _view: BufferView = new BufferView("Float32", BufferUsageFlagBits.UNIFORM);
    get buffer(): Buffer {
        return this._view.buffer;
    }

    get range(): number {
        return BlockSize;
    }

    override get dynamicOffset(): number {
        let index = -1;
        for (const camera of Zero.instance.scene.cameras) {
            if (camera.visibilities & this._data.shadow_visibilities) {
                index++;
                if (camera == this._data.camera) {
                    break;
                }
            }
        }
        return UBO.align(BlockSize) * (this._num * index + this._data.flowLoopIndex);
    }

    constructor(data: Data, visibilities: number, private readonly _num: number) {
        super(data, visibilities);
        data.shadow_visibilities = visibilities;
        data.shadow_cascades = _num;
    }

    update(dumping: boolean): void {
        const size = UBO.align(BlockSize);

        let index = -1;
        for (const camera of Zero.instance.scene.cameras) {
            if (camera.visibilities & this._data.shadow_visibilities) {
                index++;
                const cascades = this._data.getView(camera).shadow!;
                if (dumping || cascades.hasChanged) {
                    this._view.resize(size * this._num * (index + 1) / this._view.BYTES_PER_ELEMENT);
                    for (let j = 0; j < this._num; j++) {
                        this._view.set(cascades.viewProjs[j], (size / this._view.BYTES_PER_ELEMENT) * (this._num * index + j));
                    }
                }
            }
        }

        this._view.update();
    }
}