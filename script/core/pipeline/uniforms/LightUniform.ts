import { BufferUsageFlagBits } from "../../gfx/Buffer.js";
import { DescriptorSet } from "../../gfx/Pipeline.js";
import vec3 from "../../math/vec3.js";
import shaders from "../../shaders.js";
import BufferView from "../buffers/BufferView.js";
import PipelineUniform from "../PipelineUniform.js";

const LightBlock = shaders.sets.global.uniforms.Light;

export default class LightUniform implements PipelineUniform {
    private _buffer: BufferView;

    constructor(globalDescriptorSet: DescriptorSet) {
        const buffer = new BufferView("Float32", BufferUsageFlagBits.UNIFORM, LightBlock.size);
        globalDescriptorSet.bindBuffer(LightBlock.binding, buffer.buffer)
        this._buffer = buffer;
    }

    update(): void {
        const renderScene = zero.renderScene;
        const dirtyObjects = renderScene.dirtyObjects;
        const directionalLight = renderScene.directionalLight;
        if (dirtyObjects.has(directionalLight) || dirtyObjects.has(directionalLight.node)) {
            directionalLight.node.updateTransform();
            const litDir = vec3.transformMat4(vec3.create(), vec3.ZERO, directionalLight.node.matrix);
            vec3.normalize(litDir, litDir);
            this._buffer.set(litDir, 0);
            this._buffer.update();
        }
    }
}