import { DescriptorSet } from "../gfx/Pipeline.js";
import shaders from "../shaders.js";
import Model from "./Model.js";
import RenderCamera from "./RenderCamera.js";
import RenderDirectionalLight from "./RenderDirectionalLight.js";
import ResizableBuffer from "./ResizableBuffer.js";

export default class RenderScene {
    private _globalUbo: ResizableBuffer;
    private _globalUboDirty: boolean = true;

    private _directionalLight!: RenderDirectionalLight;
    set directionalLight(value: RenderDirectionalLight) {
        this._directionalLight = value;
        this._globalUboDirty = true;
    }

    private _camerasUbo: ResizableBuffer;

    private _cameras: RenderCamera[] = [];
    get cameras(): RenderCamera[] {
        return this._cameras;
    }

    private _models: Model[] = [];
    get models(): Model[] {
        return this._models;
    }

    constructor(globalDescriptorSet: DescriptorSet) {
        const GlobalBlock = shaders.builtinUniformBlocks.global.blocks.Global;
        const globalUbo = new ResizableBuffer(globalDescriptorSet, GlobalBlock.binding);
        globalUbo.reset(GlobalBlock.size);
        this._globalUbo = globalUbo;

        const CameraBlock = shaders.builtinUniformBlocks.global.blocks.Camera;
        this._camerasUbo = new ResizableBuffer(globalDescriptorSet, CameraBlock.binding, CameraBlock.size);
    }

    update(dt: number) {
        if (this._globalUboDirty) {
            this._globalUbo.set(this._directionalLight.direction, 0);
            this._globalUbo.update();
            this._globalUboDirty = false;
        }

        const CameraBlock = shaders.builtinUniformBlocks.global.blocks.Camera;
        const camerasUboSize = CameraBlock.size * this._cameras.length;
        this._camerasUbo.resize(camerasUboSize);

        let camerasDataOffset = 0;
        let camerasDataDirty = false;
        for (let i = 0; i < this._cameras.length; i++) {
            const camera = this._cameras[i];
            if (camera.update()) {
                this._camerasUbo.set(camera.matView, camerasDataOffset + CameraBlock.uniforms.matView.offset);
                this._camerasUbo.set(camera.matProj, camerasDataOffset + CameraBlock.uniforms.matProj.offset);
                this._camerasUbo.set(camera.position, camerasDataOffset + CameraBlock.uniforms.cameraPos.offset);
                camerasDataDirty = true;
            }
            camerasDataOffset += CameraBlock.size / Float32Array.BYTES_PER_ELEMENT;
        }

        if (camerasDataDirty) {
            this._camerasUbo.update();
        }

        for (let i = 0; i < this._models.length; i++) {
            this._models[i].update()
        }
    }
}