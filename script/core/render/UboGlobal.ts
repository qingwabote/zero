import { BufferUsageFlagBits } from "../gfx/Buffer.js";
import { DescriptorSet } from "../gfx/Pipeline.js";
import mat3 from "../math/mat3.js";
import mat4 from "../math/mat4.js";
import quat from "../math/quat.js";
import vec3 from "../math/vec3.js";
import shaders from "../shaders.js";
import BufferView from "./BufferView.js";
import BufferViewResizable from "./BufferViewResizable.js";

const GlobalBlock = shaders.builtinUniformBlocks.global.blocks.Global;
const CameraBlock = shaders.builtinUniformBlocks.global.blocks.Camera;
const ShadowBlock = shaders.builtinUniformBlocks.global.blocks.Shadow;

export default class UboGlobal {
    private _globalUbo: BufferView;
    private _camerasUbo: BufferViewResizable;

    private _shadowUbo: BufferView;

    constructor(globalDescriptorSet: DescriptorSet) {
        const globalUbo = new BufferView("Float32", BufferUsageFlagBits.UNIFORM, GlobalBlock.size);
        globalDescriptorSet.bindBuffer(GlobalBlock.binding, globalUbo.buffer)
        this._globalUbo = globalUbo;

        this._camerasUbo = new BufferViewResizable("Float32", BufferUsageFlagBits.UNIFORM, buffer => { globalDescriptorSet.bindBuffer(CameraBlock.binding, buffer, CameraBlock.size); });

        const shadowUbo = new BufferView("Float32", BufferUsageFlagBits.UNIFORM, ShadowBlock.size);
        globalDescriptorSet.bindBuffer(ShadowBlock.binding, shadowUbo.buffer);
        this._shadowUbo = shadowUbo;

    }

    update() {
        const renderScene = zero.renderScene;
        const dirtyObjects = renderScene.dirtyObjects;
        const directionalLight = renderScene.directionalLight;
        if (dirtyObjects.has(directionalLight) || dirtyObjects.has(directionalLight.node)) {
            directionalLight.node.updateTransform();
            const litDir = vec3.transformMat4(vec3.create(), vec3.Zero, directionalLight.node.matrix);
            vec3.normalize(litDir, litDir);
            this._globalUbo.set(litDir, 0);
            this._globalUbo.update();
        }

        const cameras = zero.renderScene.cameras;
        const camerasUboSize = CameraBlock.size * cameras.length;
        this._camerasUbo.resize(camerasUboSize);
        let camerasDataOffset = 0;
        let camerasDataDirty = false;
        for (let i = 0; i < cameras.length; i++) {
            const camera = cameras[i];
            if (dirtyObjects.has(camera) || dirtyObjects.has(camera.node)) {
                camera.node.updateTransform();

                const view = mat4.invert(mat4.create(), camera.node.matrix)
                this._camerasUbo.set(view, camerasDataOffset + CameraBlock.uniforms.view.offset);

                const projection = mat4.create();
                const aspect = camera.viewport.width / camera.viewport.height;
                if (camera.orthoHeight != -1) {
                    const x = camera.orthoHeight * aspect;
                    const y = camera.orthoHeight;
                    mat4.ortho(projection, -x, x, -y, y, camera.near, camera.far, gfx.capabilities.clipSpaceMinZ);
                } else if (camera.fov != -1) {
                    mat4.perspective(projection, Math.PI / 180 * camera.fov, aspect, camera.near, camera.far);
                }
                this._camerasUbo.set(projection, camerasDataOffset + CameraBlock.uniforms.projection.offset);

                const position = vec3.transformMat4(vec3.create(), vec3.Zero, camera.node.matrix);
                this._camerasUbo.set(position, camerasDataOffset + CameraBlock.uniforms.position.offset);

                camerasDataDirty = true;
            }
            camerasDataOffset += CameraBlock.size / Float32Array.BYTES_PER_ELEMENT;
        }
        if (camerasDataDirty) {
            this._camerasUbo.update();
        }

        if (dirtyObjects.has(directionalLight) || dirtyObjects.has(directionalLight.node)) {
            const lightPos = directionalLight.node.position;
            const rotation = quat.fromMat3(quat.create(), mat3.fromViewUp(mat3.create(), vec3.normalize(vec3.create(), lightPos)));
            const model = mat4.fromRTS(mat4.create(), rotation, lightPos, vec3.create(1, 1, 1));
            this._shadowUbo.set(mat4.invert(mat4.create(), model), ShadowBlock.uniforms.view.offset);
            const lightProjection = mat4.ortho(mat4.create(), -4, 4, -4, 4, 1, 10, gfx.capabilities.clipSpaceMinZ);
            this._shadowUbo.set(lightProjection, ShadowBlock.uniforms.projection.offset);
            this._shadowUbo.update();
        }
    }
}