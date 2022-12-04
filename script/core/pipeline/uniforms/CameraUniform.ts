import { BufferUsageFlagBits } from "../../gfx/Buffer.js";
import DescriptorSet from "../../gfx/DescriptorSet.js";
import mat4 from "../../math/mat4.js";
import vec3 from "../../math/vec3.js";
import shaders from "../../shaders.js";
import BufferViewResizable from "../buffers/BufferViewResizable.js";
import PipelineUniform from "../PipelineUniform.js";

const CameraBlock = shaders.sets.global.uniforms.Camera;

export default class CameraUniform implements PipelineUniform {
    private _buffer: BufferViewResizable;

    constructor(globalDescriptorSet: DescriptorSet) {
        this._buffer = new BufferViewResizable("Float32", BufferUsageFlagBits.UNIFORM, buffer => { globalDescriptorSet.bindBuffer(CameraBlock.binding, buffer, CameraBlock.size); });
    }

    update(): void {
        const renderScene = zero.renderScene;
        const dirtyObjects = renderScene.dirtyObjects;
        const cameras = renderScene.cameras;
        const camerasUboSize = CameraBlock.size * cameras.length;
        this._buffer.resize(camerasUboSize);
        let camerasDataOffset = 0;
        let camerasDataDirty = false;
        for (let i = 0; i < cameras.length; i++) {
            const camera = cameras[i];
            if (dirtyObjects.has(camera) || dirtyObjects.has(camera.node)) {
                camera.node.updateTransform();

                const view = mat4.invert(mat4.create(), camera.node.matrix)
                this._buffer.set(view, camerasDataOffset + CameraBlock.uniforms.view.offset);

                const projection = mat4.create();
                const aspect = camera.viewport.width / camera.viewport.height;
                if (camera.orthoHeight != -1) {
                    const x = camera.orthoHeight * aspect;
                    const y = camera.orthoHeight;
                    mat4.ortho(projection, -x, x, -y, y, camera.near, camera.far, gfx.capabilities.clipSpaceMinZ);
                } else if (camera.fov != -1) {
                    mat4.perspective(projection, Math.PI / 180 * camera.fov, aspect, camera.near, camera.far);
                }
                this._buffer.set(projection, camerasDataOffset + CameraBlock.uniforms.projection.offset);

                const position = vec3.transformMat4(vec3.create(), vec3.ZERO, camera.node.matrix);
                this._buffer.set(position, camerasDataOffset + CameraBlock.uniforms.position.offset);

                camerasDataDirty = true;
            }
            camerasDataOffset += CameraBlock.size / Float32Array.BYTES_PER_ELEMENT;
        }
        if (camerasDataDirty) {
            this._buffer.update();
        }
    }

}