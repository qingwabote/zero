import { Buffer, BufferUsageFlagBits, DescriptorType, ShaderStageFlagBits } from "gfx";
import { Zero } from "../../core/Zero.js";
import { vec3 } from "../../core/math/vec3.js";
import { UniformBufferObject } from "../../core/render/pipeline/UniformBufferObject.js";
import { BufferView } from "../../core/render/scene/buffers/BufferView.js";

const LightBlock = {
    type: DescriptorType.UNIFORM_BUFFER,
    stageFlags: ShaderStageFlagBits.FRAGMENT,
    members: {
        direction: {}
    },
    size: 3 * Float32Array.BYTES_PER_ELEMENT
}

export class LightUniform extends UniformBufferObject {
    static readonly definition = LightBlock;

    private _buffer: BufferView = new BufferView("Float32", BufferUsageFlagBits.UNIFORM, LightBlock.size);

    get buffer(): Buffer {
        return this._buffer.buffer;
    }

    update(): void {
        const renderScene = Zero.instance.scene;
        const directionalLight = renderScene.directionalLight!;
        if (directionalLight.hasChanged) {
            const litDir = vec3.normalize(vec3.create(), directionalLight.position);
            this._buffer.set(litDir, 0);
            this._buffer.update();
        }
    }
}