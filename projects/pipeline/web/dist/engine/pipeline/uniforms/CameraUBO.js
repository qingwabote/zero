import { device } from "boot";
import { BufferUsageFlagBits, DescriptorType, ShaderStageFlagBits } from "gfx";
import { Zero } from "../../core/Zero.js";
import { BufferView } from "../../core/render/BufferView.js";
import { UniformBufferObject } from "../../core/render/pipeline/UniformBufferObject.js";
function align(size) {
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
};
export class CameraUBO extends UniformBufferObject {
    constructor() {
        super(...arguments);
        this._buffer = new BufferView("Float32", BufferUsageFlagBits.UNIFORM, CameraBlock.size);
    }
    get buffer() {
        return this._buffer.buffer;
    }
    get range() {
        return CameraBlock.size;
    }
    dynamicOffset(params) {
        return CameraBlock.size * params.cameraIndex;
    }
    ;
    update() {
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
CameraUBO.definition = CameraBlock;
