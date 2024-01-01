import { device } from "boot";
import { BufferUsageFlagBits, DescriptorType, ShaderStageFlagBits } from "gfx";
import { Zero } from "../../core/Zero.js";
import { Context } from "../../core/render/Context.js";
import { Uniform } from "../../core/render/pipeline/Uniform.js";
import { BufferViewWritable } from "../../core/render/scene/buffers/BufferViewWritable.js";

function align(size: number) {
    const alignment = device.capabilities.uniformBufferOffsetAlignment;
    return Math.ceil(size / alignment) * alignment;
}

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
    size: align((16 + 16 + 4) * Float32Array.BYTES_PER_ELEMENT),
}

export class CameraUniform extends Uniform {
    static readonly definition = CameraBlock;

    private _buffer: BufferViewWritable = new BufferViewWritable("Float32", BufferUsageFlagBits.UNIFORM, CameraBlock.size);

    get dynamicOffset(): number {
        return CameraBlock.size * this._context.cameraIndex
    };

    constructor(context: Context, binding: number) {
        super(context, binding);
        context.descriptorSet.bindBuffer(binding, this._buffer.buffer, CameraBlock.size)
    }

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