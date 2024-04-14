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

    private _view: BufferView = new BufferView("Float32", BufferUsageFlagBits.UNIFORM);

    get buffer(): Buffer {
        return this._view.buffer;
    }

    get range(): number {
        return CameraBlock.size;
    }

    override dynamicOffset(params: Parameters): number {
        return CameraBlock.size * params.cameraIndex
    };

    update(dumping: boolean): void {
        const cameras = Zero.instance.scene.cameras;
        this._view.resize(CameraBlock.size * cameras.length / this._view.BYTES_PER_ELEMENT);
        for (let i = 0; i < cameras.length; i++) {
            const camera = cameras[i];
            if (dumping || camera.hasChanged) {
                const offset = (CameraBlock.size / this._view.source.BYTES_PER_ELEMENT) * i;
                this._view.set(camera.matView, offset + CameraBlock.members.view.offset);
                this._view.set(camera.matProj, offset + CameraBlock.members.projection.offset);
                this._view.set(camera.position, offset + CameraBlock.members.position.offset);
            }
        }
        this._view.update();
    }
}