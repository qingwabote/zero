import { BufferUsageFlagBits } from "../../gfx/Buffer.js";
import { DescriptorSetLayoutBinding, DescriptorType } from "../../gfx/DescriptorSetLayout.js";
import vec3 from "../../math/vec3.js";
import BufferView from "../../render/buffers/BufferView.js";
import ShaderLib from "../../ShaderLib.js";
import PipelineUniform from "../PipelineUniform.js";

const LightBlock = {
    type: DescriptorType.UNIFORM_BUFFER,
    binding: 0,
    uniforms: {
        direction: {}
    },
    size: 3 * Float32Array.BYTES_PER_ELEMENT
}

const descriptorSetLayoutBinding = ShaderLib.createDescriptorSetLayoutBinding(LightBlock);

export default class LightUniform implements PipelineUniform {
    get descriptorSetLayoutBinding(): DescriptorSetLayoutBinding {
        return descriptorSetLayoutBinding;
    }

    private _buffer!: BufferView;

    initialize(): void {
        const buffer = new BufferView("Float32", BufferUsageFlagBits.UNIFORM, LightBlock.size);
        zero.renderFlow.globalDescriptorSet.bindBuffer(LightBlock.binding, buffer.buffer)
        this._buffer = buffer;
    }

    update(): void {
        const renderScene = zero.render_scene;
        const directionalLight = renderScene.directionalLight;
        if (directionalLight.hasChanged) {
            const litDir = vec3.normalize(vec3.create(), directionalLight.position);
            this._buffer.set(litDir, 0);
            this._buffer.update();
        }
    }
}