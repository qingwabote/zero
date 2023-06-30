import { BufferUsageFlagBits, DescriptorType, ShaderStageFlagBits } from "../../core/gfx/info.js";
import vec3 from "../../core/math/vec3.js";
import Uniform from "../../core/pipeline/Uniform.js";
import BufferViewWritable from "../../core/scene/buffers/BufferViewWritable.js";

const LightBlock = {
    type: DescriptorType.UNIFORM_BUFFER,
    stageFlags: ShaderStageFlagBits.FRAGMENT,
    binding: 0,
    members: {
        direction: {}
    },
    size: 3 * Float32Array.BYTES_PER_ELEMENT
} as const

export default class LightUniform implements Uniform {
    readonly definition = LightBlock;

    private _buffer!: BufferViewWritable;

    initialize(): void {
        const buffer = new BufferViewWritable("Float32", BufferUsageFlagBits.UNIFORM, LightBlock.size);
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