import { BufferUsageFlagBits } from "../../core/gfx/Buffer.js";
import { DescriptorSetLayoutBinding } from "../../core/gfx/DescriptorSetLayout.js";
import Uniform from "../../core/render/Uniform.js";
import BufferViewResizable from "../../core/scene/buffers/BufferViewResizable.js";
import ShaderLib from "../../core/ShaderLib.js";

const CameraBlock = ShaderLib.sets.global.uniforms.Camera;

const descriptorSetLayoutBinding = ShaderLib.createDescriptorSetLayoutBinding(CameraBlock);

export default class CameraUniform implements Uniform {
    get descriptorSetLayoutBinding(): DescriptorSetLayoutBinding {
        return descriptorSetLayoutBinding;
    }

    private _buffer!: BufferViewResizable;

    initialize(): void {
        this._buffer = new BufferViewResizable("Float32", BufferUsageFlagBits.UNIFORM, buffer => { zero.flow.globalDescriptorSet.bindBuffer(CameraBlock.binding, buffer, CameraBlock.size); });
    }

    update(): void {
        const renderScene = zero.scene;
        const cameras = renderScene.cameras;
        const camerasUboSize = CameraBlock.size * cameras.length;
        this._buffer.resize(camerasUboSize / this._buffer.BYTES_PER_ELEMENT);
        let camerasDataOffset = 0;
        for (let i = 0; i < cameras.length; i++) {
            const camera = cameras[i];
            if (camera.hasChanged) {
                this._buffer.set(camera.matView, camerasDataOffset + CameraBlock.uniforms.view.offset);

                this._buffer.set(camera.matProj, camerasDataOffset + CameraBlock.uniforms.projection.offset);

                this._buffer.set(camera.position, camerasDataOffset + CameraBlock.uniforms.position.offset);

            }
            camerasDataOffset += CameraBlock.size / Float32Array.BYTES_PER_ELEMENT;
        }
        this._buffer.update();
    }

}