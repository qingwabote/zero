import { Buffer, BufferUsageFlagBits, DescriptorType, ShaderStageFlagBits } from "gfx";
import { Zero } from "../../core/Zero.js";
import { BufferView } from "../../core/render/BufferView.js";
import { Data } from "../../core/render/pipeline/Data.js";
import { Parameters } from "../../core/render/pipeline/Parameters.js";
import { UBO } from "../../core/render/pipeline/UBO.js";

const Block = {
    type: DescriptorType.UNIFORM_BUFFER_DYNAMIC,
    stageFlags: ShaderStageFlagBits.VERTEX | ShaderStageFlagBits.FRAGMENT,
    members: {
        viewProj: {}
    }
}

const BlockSize = 16 * Float32Array.BYTES_PER_ELEMENT;

export class CSMUBO extends UBO {

    static readonly definition = Block;

    private _view: BufferView = new BufferView("Float32", BufferUsageFlagBits.UNIFORM);
    get buffer(): Buffer {
        return this._view.buffer;
    }

    get range(): number {
        return BlockSize * this._num
    }

    constructor(data: Data, visibilities: number, private readonly _num: number) {
        super(data, visibilities);
    }

    override dynamicOffset(params: Parameters): number {
        const index = this._data.shadow!.visibleCameras.findIndex(cameraIndex => cameraIndex == params.cameraIndex);
        if (index == -1) {
            return 0;
        }
        return UBO.align(this.range) * index;
    }

    update(dumping: boolean): void {
        const size = UBO.align(this.range);

        const shadow = this._data.shadow!;
        const cameras = Zero.instance.scene.cameras;

        this._view.resize(size * shadow.visibleCameras.length / this._view.BYTES_PER_ELEMENT);

        for (let i = 0; i < shadow.visibleCameras.length; i++) {
            const offset = (size / this._view.BYTES_PER_ELEMENT) * i;
            const cascades = shadow.getCascades(cameras[shadow.visibleCameras[i]])!;
            if (dumping || cascades.hasChanged) {
                for (let j = 0; j < this._num; j++) {
                    this._view.set(cascades.viewProjs[j], offset + 16 * j);
                }
            }
        }

        this._view.update();
    }

}