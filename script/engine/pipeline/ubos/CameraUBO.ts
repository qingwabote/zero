import { Buffer, BufferUsageFlagBits, DescriptorType, ShaderStageFlagBits } from "gfx";
import { Zero } from "../../core/Zero.js";
import { BufferView } from "../../core/render/BufferView.js";
import { Parameters } from "../../core/render/pipeline/Parameters.js";
import { UBO } from "../../core/render/pipeline/UBO.js";

const Block = {
    type: DescriptorType.UNIFORM_BUFFER_DYNAMIC,
    stageFlags: ShaderStageFlagBits.VERTEX | ShaderStageFlagBits.FRAGMENT,
    members: {
        view: {
            offset: 0
        },
        projection: {
            offset: 16
        },
        position: {
            offset: 16 + 16
        }
    },
    size: (16 + 16 + 4) * Float32Array.BYTES_PER_ELEMENT,
}

export class CameraUBO extends UBO {
    static readonly definition = Block;

    private _view: BufferView = new BufferView("Float32", BufferUsageFlagBits.UNIFORM);

    get buffer(): Buffer {
        return this._view.buffer;
    }

    override dynamicOffset(params: Parameters): number {
        return UBO.align(Block.size) * params.cameraIndex
    };

    update(dumping: boolean): void {
        const size = UBO.align(Block.size);
        const cameras = Zero.instance.scene.cameras;

        this._view.resize(size * cameras.length / this._view.BYTES_PER_ELEMENT);
        for (let i = 0; i < cameras.length; i++) {
            const camera = cameras[i];
            if (dumping || camera.hasChanged || camera.transform.hasChanged) {
                const offset = (size / this._view.source.BYTES_PER_ELEMENT) * i;
                this._view.set(camera.matView, offset + Block.members.view.offset);
                this._view.set(camera.matProj, offset + Block.members.projection.offset);
                this._view.set(camera.position, offset + Block.members.position.offset);
            }
        }
        this._view.update();
    }
}