import { Buffer, BufferUsageFlagBits, DescriptorType, ShaderStageFlagBits } from "gfx";
import { Zero } from "../../core/Zero.js";
import { BufferView } from "../../core/render/BufferView.js";
import { Parameters } from "../../core/render/pipeline/Parameters.js";
import { UBO } from "../../core/render/pipeline/UBO.js";

const CameraBlock = {
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
    size: UBO.align((16 + 16 + 4) * Float32Array.BYTES_PER_ELEMENT),
}

export class CameraUBO extends UBO {
    static readonly definition = CameraBlock;

    private _buffer: BufferView = new BufferView("Float32", BufferUsageFlagBits.UNIFORM, CameraBlock.size);

    get buffer(): Buffer {
        return this._buffer.buffer;
    }

    get range(): number {
        return CameraBlock.size;
    }

    override dynamicOffset(params: Parameters): number {
        return CameraBlock.size * params.cameraIndex
    };

    update(): void {
        const renderScene = Zero.instance.scene;
        const cameras = renderScene.cameras;
        const camerasUboSize = CameraBlock.size * cameras.length;
        this._buffer.resize(camerasUboSize / this._buffer.BYTES_PER_ELEMENT);
        let camerasDataOffset = 0;
        for (let i = 0; i < cameras.length; i++) {
            const camera = cameras[i];
            if (camera.hasChanged) {
                this._buffer.set(camera.matView, camerasDataOffset + CameraBlock.members.view.offset);
                this._buffer.set(camera.matProj, camerasDataOffset + CameraBlock.members.projection.offset);
                this._buffer.set(camera.position, camerasDataOffset + CameraBlock.members.position.offset);
            }
            camerasDataOffset += CameraBlock.size / Float32Array.BYTES_PER_ELEMENT;
        }
        this._buffer.update();
    }
}