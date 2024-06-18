import { Buffer, BufferUsageFlagBits, DescriptorType, ShaderStageFlagBits } from "gfx";
import { Zero } from "../../core/Zero.js";
import { BufferView } from "../../core/render/BufferView.js";
import { Data } from "../../core/render/pipeline/Data.js";
import { Parameters } from "../../core/render/pipeline/Parameters.js";
import { Shadow } from "../../core/render/pipeline/Shadow.js";
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

    constructor(data: Data, visibilities: number, private readonly _num: number) {
        super(data, visibilities);
        data.shadow = new Shadow(visibilities, _num);
    }

    override dynamicOffset(params: Parameters): number {
        const index = this._data.shadow!.visibleCameras.findIndex(cameraIndex => cameraIndex == params.cameraIndex);
        const offset = UBO.align(BlockSize) * (this._num * index + this._data.flowLoopIndex);
        return offset;
    }

    update(dumping: boolean): void {
        const size = UBO.align(BlockSize);

        const shadow = this._data.shadow!;

        this._view.resize(size * this._num * shadow.visibleCameras.length / this._view.BYTES_PER_ELEMENT);

        const cameras = Zero.instance.scene.cameras;

        for (let i = 0; i < shadow.visibleCameras.length; i++) {
            const cascades = shadow.getCascades(cameras[shadow.visibleCameras[i]])!;
            if (dumping || cascades.hasChanged) {
                for (let j = 0; j < this._num; j++) {
                    this._view.set(cascades.viewProjs[j], (size / this._view.BYTES_PER_ELEMENT) * (this._num * i + j));
                }
            }
        }

        this._view.update();
    }
}