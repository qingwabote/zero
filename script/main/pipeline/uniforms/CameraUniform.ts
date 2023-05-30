import { BufferUsageFlagBits } from "../../core/gfx/Buffer.js";
import Uniform from "../../core/pipeline/Uniform.js";
import BufferViewResizable from "../../core/scene/buffers/BufferViewResizable.js";
import shaderLib from "../../core/shaderLib.js";

const CameraBlock = shaderLib.sets.global.uniforms.Camera;

export default class CameraUniform implements Uniform {
    readonly definition = CameraBlock;

    private _buffer: BufferViewResizable = new BufferViewResizable("Float32", BufferUsageFlagBits.UNIFORM);

    initialize(): void { }

    update(): void {
        const renderScene = zero.scene;
        const cameras = renderScene.cameras;
        const camerasUboSize = CameraBlock.size * cameras.length;
        if (this._buffer.resize(camerasUboSize / this._buffer.BYTES_PER_ELEMENT)) {
            zero.flow.globalDescriptorSet.bindBuffer(CameraBlock.binding, this._buffer.buffer, CameraBlock.size)
        }
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