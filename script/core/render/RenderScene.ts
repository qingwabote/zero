import Buffer, { BufferUsageFlagBits, MemoryUsage } from "../gfx/Buffer.js";
import { BuiltinUniformBlocks } from "../shaders.js";
import Model from "./Model.js";
import RenderCamera from "./RenderCamera.js";

export default class RenderScene {
    private _cameras: RenderCamera[] = [];
    get cameras(): RenderCamera[] {
        return this._cameras;
    }

    private _camerasData: Float32Array | null = null;

    private _camerasUbo: Buffer | null = null;

    private _models: Model[] = [];
    get models(): Model[] {
        return this._models;
    }

    update(dt: number) {
        const alignment = zero.gfx.capabilities.uniformBufferOffsetAlignment;
        const CameraBlock = BuiltinUniformBlocks.global.blocks.Camera;
        const cameraUboSize = Math.ceil(CameraBlock.size / alignment) * alignment;
        const camerasUboSize = cameraUboSize * this._cameras.length;
        const camerasDataLength = camerasUboSize / Float32Array.BYTES_PER_ELEMENT;

        if (this._camerasData && this._camerasData.length < camerasDataLength) {
            this._camerasData = null;
        }
        if (!this._camerasData) {
            this._camerasData = new Float32Array(camerasDataLength);
        }

        let camerasDataOffset = 0;
        let camerasDataDirty = false;
        for (let i = 0; i < this._cameras.length; i++) {
            const camera = this._cameras[i];
            if (camera.update()) {
                this._camerasData.set(camera.matView, camerasDataOffset);
                this._camerasData.set(camera.matProj, camerasDataOffset + camera.matView.length);
                camerasDataDirty = true;
            }
            camerasDataOffset += cameraUboSize / Float32Array.BYTES_PER_ELEMENT;
        }

        if (camerasDataDirty) {
            if (this._camerasUbo && this._camerasUbo.info.size < camerasUboSize) {
                this._camerasUbo.destroy();
                this._camerasUbo = null;
            }
            if (!this._camerasUbo) {
                this._camerasUbo = zero.gfx.createBuffer();
                this._camerasUbo.initialize({ usage: BufferUsageFlagBits.UNIFORM, mem_usage: MemoryUsage.CPU_TO_GPU, size: camerasUboSize });
                zero.globalDescriptorSet.bindBuffer(CameraBlock.binding, this._camerasUbo, cameraUboSize);
            }
            this._camerasUbo.update(this._camerasData);
        }

        for (let i = 0; i < this._models.length; i++) {
            this._models[i].update()
        }
    }
}