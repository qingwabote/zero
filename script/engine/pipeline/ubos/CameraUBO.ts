import { Buffer, BufferUsageFlagBits, DescriptorType, ShaderStageFlagBits } from "gfx";
import { Zero } from "../../core/Zero.js";
import { BufferView } from "../../core/render/BufferView.js";
import { TransformChangeBit } from "../../core/render/index.js";
import { Parameters } from "../../core/render/pipeline/Parameters.js";
import { UBO } from "../../core/render/pipeline/UBO.js";
import { CameraChangeBit } from "../../core/render/scene/Camera.js";

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
    }
}

const BlockSize = (16 + 16 + 4) * Float32Array.BYTES_PER_ELEMENT;

export class CameraUBO extends UBO {

    static readonly definition = Block;

    private _view: BufferView = new BufferView("Float32", BufferUsageFlagBits.UNIFORM);

    get buffer(): Buffer {
        return this._view.buffer;
    }

    get range(): number {
        return BlockSize
    }

    override dynamicOffset(params: Parameters): number {
        return UBO.align(BlockSize) * params.cameraIndex
    };

    update(dumping: boolean): void {
        const size = UBO.align(BlockSize);
        const cameras = Zero.instance.scene.cameras;

        this._view.resize(size * cameras.length / this._view.BYTES_PER_ELEMENT);
        for (let i = 0; i < cameras.length; i++) {
            const camera = cameras[i];
            const offset = (size / this._view.source.BYTES_PER_ELEMENT) * i;
            if (dumping || (camera.hasChanged & CameraChangeBit.VIEW)) {
                this._view.set(camera.view, offset + Block.members.view.offset);
            }
            if (dumping || (camera.hasChanged & CameraChangeBit.PROJ)) {
                this._view.set(camera.proj, offset + Block.members.projection.offset);
            }
            if (dumping || (camera.transform.hasChanged & TransformChangeBit.POSITION)) {
                this._view.set(camera.transform.world_position, offset + Block.members.position.offset);
            }
        }
        this._view.update();
    }
}