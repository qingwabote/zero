import shaders from "../shaders.js";
import ResizableBuffer from "./ResizableBuffer.js";
export default class RenderScene {
    _globalUbo;
    _globalUboDirty = true;
    _directionalLight;
    set directionalLight(value) {
        this._directionalLight = value;
        this._globalUboDirty = true;
    }
    _camerasUbo;
    _cameras = [];
    get cameras() {
        return this._cameras;
    }
    _models = [];
    get models() {
        return this._models;
    }
    constructor(globalDescriptorSet) {
        const GlobalBlock = shaders.builtinUniformBlocks.global.blocks.Global;
        const globalUbo = new ResizableBuffer(globalDescriptorSet, GlobalBlock.binding);
        globalUbo.reset(GlobalBlock.size);
        this._globalUbo = globalUbo;
        const CameraBlock = shaders.builtinUniformBlocks.global.blocks.Camera;
        this._camerasUbo = new ResizableBuffer(globalDescriptorSet, CameraBlock.binding, CameraBlock.size);
    }
    update(dt) {
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
            this._models[i].update();
        }
    }
}
//# sourceMappingURL=RenderScene.js.map