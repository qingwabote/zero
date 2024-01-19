import { Buffer, BufferUsageFlagBits, DescriptorType, ShaderStageFlagBits } from "gfx";
import { Zero } from "../../core/Zero.js";
import { vec3 } from "../../core/math/vec3.js";
import { BufferView } from "../../core/render/BufferView.js";
import { UniformBufferObject } from "../../core/render/pipeline/UniformBufferObject.js";

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

    private _view: BufferView = new BufferView("Float32", BufferUsageFlagBits.UNIFORM, LightBlock.size);
    get buffer(): Buffer {
        return this._view.buffer;
    }

    private _dirty = true;

    update(): void {
        const light = Zero.instance.scene.directionalLight!;

        if (this._dirty || light.hasChanged) {
            const litDir = vec3.normalize(vec3.create(), light.position);
            this._view.set(litDir, 0);
            this._view.update();

            this._dirty = false;
        }
    }
}