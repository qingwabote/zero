import { Buffer, BufferUsageFlagBits, DescriptorType, ShaderStageFlagBits } from "gfx";
import { BufferView } from "../../core/render/BufferView.js";
import { Data } from "../../core/render/pipeline/Data.js";
import { Parameters } from "../../core/render/pipeline/Parameters.js";
import { UBO } from "../../core/render/pipeline/UBO.js";

const Block = {
    type: DescriptorType.UNIFORM_BUFFER_DYNAMIC,
    stageFlags: ShaderStageFlagBits.VERTEX | ShaderStageFlagBits.FRAGMENT,
    members: {
        viewProj: {
            offset: 0
        }
    },
    size: 16 * Float32Array.BYTES_PER_ELEMENT,
}

export class ShadowUBO extends UBO {
    static readonly definition = Block;

    private _view: BufferView = new BufferView("Float32", BufferUsageFlagBits.UNIFORM);
    get buffer(): Buffer {
        return this._view.buffer;
    }

    override dynamicOffset(params: Parameters): number {
        return UBO.align(Block.size) * this._data.shadow.visibleCameras.findIndex(cameraIndex => cameraIndex == params.cameraIndex);
    }

    constructor(data: Data, visibilities: number) {
        super(data, visibilities);
        data.shadow.visibilities = visibilities;
    }

    update(dumping: boolean): void {
        const size = UBO.align(Block.size);

        this._view.resize(size * this._data.shadow.visibleCameras.length / this._view.BYTES_PER_ELEMENT);

        for (let i = 0; i < this._data.shadow.visibleCameras.length; i++) {
            const shadow = this._data.shadow.boundingFrusta[this._data.shadow.visibleCameras[i]].levels[0];
            if (dumping || shadow.hasChanged) {
                const offset = (size / this._view.source.BYTES_PER_ELEMENT) * i;
                this._view.set(shadow.viewProj, offset + Block.members.viewProj.offset);
            }
        }

        this._view.update();
    }

}