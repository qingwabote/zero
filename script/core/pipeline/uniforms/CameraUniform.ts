import { BufferUsageFlagBits } from "../../gfx/Buffer.js";
import { DescriptorSetLayoutBinding, DescriptorType } from "../../gfx/DescriptorSetLayout.js";
import BufferViewResizable from "../../render/buffers/BufferViewResizable.js";
import ShaderLib from "../../ShaderLib.js";
import PipelineUniform from "../PipelineUniform.js";

const CameraBlock = {
    type: DescriptorType.UNIFORM_BUFFER_DYNAMIC,
    binding: 1,
    uniforms: {
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
    size: ShaderLib.align((16 + 16 + 4) * Float32Array.BYTES_PER_ELEMENT),
}

const descriptorSetLayoutBinding = ShaderLib.createDescriptorSetLayoutBinding(CameraBlock);

export default class CameraUniform implements PipelineUniform {
    static getDynamicOffset(index: number): number {
        return index * CameraBlock.size;
    }

    get descriptorSetLayoutBinding(): DescriptorSetLayoutBinding {
        return descriptorSetLayoutBinding;
    }

    private _buffer!: BufferViewResizable;

    initialize(): void {
        this._buffer = new BufferViewResizable("Float32", BufferUsageFlagBits.UNIFORM, buffer => { zero.renderFlow.globalDescriptorSet.bindBuffer(CameraBlock.binding, buffer, CameraBlock.size); });
    }

    update(): void {
        const renderScene = zero.renderScene;
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