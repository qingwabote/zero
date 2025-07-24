import { bit, Buffer, BufferUsageFlagBits, CommandBuffer, DescriptorType, ShaderStageFlagBits } from "gfx";
import { BufferView } from "../../core/render/gfx/BufferView.js";
import { UBO } from "../../core/render/pipeline/UBO.js";
import { Scene } from "../../core/render/Scene.js";
import { Camera } from "../../core/render/scene/Camera.js";

const Block = {
    type: DescriptorType.UNIFORM_BUFFER_DYNAMIC,
    stageFlags: bit.or<ShaderStageFlagBits>(ShaderStageFlagBits.VERTEX, ShaderStageFlagBits.FRAGMENT),
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

    private _view: BufferView = new BufferView('f32', BufferUsageFlagBits.UNIFORM);

    get buffer(): Buffer {
        return this._view.buffer;
    }

    get range(): number {
        return BlockSize
    }

    override dynamicOffset(scene: Scene, cameraIndex: number): number {
        return UBO.align(BlockSize) * cameraIndex;
    };

    upload(scene: Scene, commandBuffer: CommandBuffer, dumping: boolean): void {
        const cameras = scene.cameras;

        const size = UBO.align(BlockSize);
        this._view.resize(size * cameras.length / this._view.BYTES_PER_ELEMENT);
        for (let i = 0; i < cameras.length; i++) {
            const camera = cameras[i];
            const offset = (size / this._view.BYTES_PER_ELEMENT) * i;
            if (dumping || (camera.hasChangedFlag.value & Camera.ChangeBit.VIEW) != 0) {
                this._view.set(camera.view, offset + Block.members.view.offset);
            }
            if (dumping || (camera.hasChangedFlag.value & Camera.ChangeBit.PROJ) != 0) {
                this._view.set(camera.proj, offset + Block.members.projection.offset);
            }
            if (dumping || (camera.transform.hasChangedFlag.value)) {
                this._view.set(camera.transform.world_position, offset + Block.members.position.offset);
            }
        }
        this._view.update(commandBuffer);
    }
}