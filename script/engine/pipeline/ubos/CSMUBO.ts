import { Buffer, BufferUsageFlagBits, DescriptorType, ShaderStageFlagBits } from "gfx";
import { BufferView } from "../../core/render/BufferView.js";
import { Parameters } from "../../core/render/pipeline/Parameters.js";
import { Shadow } from "../../core/render/pipeline/Shadow.js";
import { UBO } from "../../core/render/pipeline/UBO.js";

const Block = {
    type: DescriptorType.UNIFORM_BUFFER_DYNAMIC,
    stageFlags: ShaderStageFlagBits.VERTEX | ShaderStageFlagBits.FRAGMENT,
    members: {
        viewProj: {}
    },
    size: 16 * Shadow.LEVEL_COUNT * Float32Array.BYTES_PER_ELEMENT,
}

export class CSMUBO extends UBO {
    static readonly definition = Block;

    private _view: BufferView = new BufferView("Float32", BufferUsageFlagBits.UNIFORM);
    get buffer(): Buffer {
        return this._view.buffer;
    }

    override dynamicOffset(params: Parameters): number {
        const index = this._data.shadow.visibleCameras.findIndex(cameraIndex => cameraIndex == params.cameraIndex);
        if (index == -1) {
            return 0;
        }
        return UBO.align(Block.size) * index;
    }

    update(dumping: boolean): void {
        const size = UBO.align(Block.size);

        this._view.resize(size * this._data.shadow.visibleCameras.length / this._view.BYTES_PER_ELEMENT);

        for (let i = 0; i < this._data.shadow.visibleCameras.length; i++) {
            const offset = (size / this._view.BYTES_PER_ELEMENT) * i;
            const levels = this._data.shadow.boundingFrusta[this._data.shadow.visibleCameras[i]].levels;
            for (let j = 0; j < levels.length; j++) {
                const level = levels[j];
                if (dumping || level.hasChanged) {
                    this._view.set(level.viewProj, offset + 16 * j);
                }
            }
        }

        this._view.update();
    }

}