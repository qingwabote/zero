import { BufferUsageFlagBits } from "../../core/gfx/Buffer.js";
import { DescriptorSetLayoutBinding, DescriptorType } from "../../core/gfx/DescriptorSetLayout.js";
import { ShaderStageFlagBits } from "../../core/gfx/Shader.js";
import vec3 from "../../core/math/vec3.js";
import Uniform from "../../core/render/Uniform.js";
import BufferView from "../../core/scene/buffers/BufferView.js";
import ShaderLib from "../../core/ShaderLib.js";

const LightBlock = {
    type: DescriptorType.UNIFORM_BUFFER,
    stageFlags: ShaderStageFlagBits.FRAGMENT,
    binding: 0,
    members: {
        direction: {}
    },
    size: 3 * Float32Array.BYTES_PER_ELEMENT
}

const descriptorSetLayoutBinding = ShaderLib.createDescriptorSetLayoutBinding(LightBlock);

export default class LightUniform implements Uniform {
    get descriptorSetLayoutBinding(): DescriptorSetLayoutBinding {
        return descriptorSetLayoutBinding;
    }

    private _buffer!: BufferView;

    initialize(): void {
        const buffer = new BufferView("Float32", BufferUsageFlagBits.UNIFORM, LightBlock.size);
        zero.flow.globalDescriptorSet.bindBuffer(LightBlock.binding, buffer.buffer)
        this._buffer = buffer;
    }

    update(): void {
        const renderScene = zero.scene;
        const directionalLight = renderScene.directionalLight!;
        if (directionalLight.hasChanged) {
            const litDir = vec3.normalize(vec3.create(), directionalLight.position);
            this._buffer.set(litDir, 0);
            this._buffer.update();
        }
    }
}