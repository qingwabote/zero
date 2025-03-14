import { Buffer, BufferUsageFlagBits, CommandBuffer, DescriptorType, ShaderStageFlagBits } from "gfx";
import { Context } from "../../core/render/Context.js";
import { BufferView } from "../../core/render/gpu/BufferView.js";
import { Data } from "../../core/render/pipeline/Data.js";
import { UBO } from "../../core/render/pipeline/UBO.js";
import { Zero } from "../../core/Zero.js";

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

    override dynamicOffset(context: Context, cameraIndex: number): number {
        let index = -1;
        for (let i = 0; i < context.scene.cameras.length; i++) {
            const camera = context.scene.cameras[i];
            if (camera.visibilities & this._data.shadow!.visibilities) {
                index++;
                if (i == cameraIndex) {
                    return UBO.align(this.range) * index;
                }
            }
        }
        return 0;
    }

    constructor(data: Data, visibilities: number, private readonly _num: number) {
        super(data, visibilities);
    }

    upload(context: Context, commandBuffer: CommandBuffer, dumping: boolean): void {
        const size = UBO.align(this.range);

        let index = -1;
        for (const camera of Zero.instance.scene.cameras) {
            if (camera.visibilities & this._data.shadow!.visibilities) {
                index++;
                const cascades = this._data.shadow!.getCascades(camera)!;
                if (dumping || cascades.hasChanged) {
                    this._view.resize(size * (index + 1) / this._view.BYTES_PER_ELEMENT);
                    for (let j = 0; j < this._num; j++) {
                        this._view.set(cascades.viewProjs[j], (size / this._view.BYTES_PER_ELEMENT) * index + 16 * j);
                    }
                }
            }
        }

        this._view.update(commandBuffer);
    }

}