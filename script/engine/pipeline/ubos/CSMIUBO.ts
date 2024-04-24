import { Buffer, BufferUsageFlagBits, DescriptorType, ShaderStageFlagBits } from "gfx";
import { BufferView } from "../../core/render/BufferView.js";
import { Data } from "../../core/render/pipeline/Data.js";
import { Parameters } from "../../core/render/pipeline/Parameters.js";
import { UBO } from "../../core/render/pipeline/UBO.js";
import { Cascades } from "../../core/render/pipeline/shadow/Cascades.js";

const Block = {
    type: DescriptorType.UNIFORM_BUFFER_DYNAMIC,
    stageFlags: ShaderStageFlagBits.VERTEX | ShaderStageFlagBits.FRAGMENT,
    members: {
        viewProj: {}
    },
    size: 16 * Float32Array.BYTES_PER_ELEMENT,
}

/**CSM iterator UBO */
export class CSMIUBO extends UBO {
    static readonly definition = Block;

    private _view: BufferView = new BufferView("Float32", BufferUsageFlagBits.UNIFORM);
    get buffer(): Buffer {
        return this._view.buffer;
    }

    constructor(data: Data, visibilities: number) {
        super(data, visibilities);
        data.shadow.visibilities = visibilities;
    }

    override dynamicOffset(params: Parameters): number {
        const index = this._data.shadow.visibleCameras.findIndex(cameraIndex => cameraIndex == params.cameraIndex);
        const offset = UBO.align(Block.size) * (Cascades.COUNT * index + this._data.flowLoopIndex);
        return offset;
    }

    update(dumping: boolean): void {
        const size = UBO.align(Block.size);

        const shadow = this._data.shadow;

        this._view.resize(size * Cascades.COUNT * shadow.visibleCameras.length / this._view.BYTES_PER_ELEMENT);

        for (let i = 0; i < shadow.visibleCameras.length; i++) {
            const cascades = shadow.cascades[shadow.visibleCameras[i]];
            if (dumping || cascades.hasChanged) {
                for (let j = 0; j < Cascades.COUNT; j++) {
                    this._view.set(cascades.viewProjs[j], (size / this._view.BYTES_PER_ELEMENT) * (Cascades.COUNT * i + j));
                }
            }
        }

        this._view.update();
    }

}