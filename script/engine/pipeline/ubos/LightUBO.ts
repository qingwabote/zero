import { Buffer, BufferUsageFlagBits, CommandBuffer, DescriptorType, ShaderStageFlagBits } from "gfx";
import { vec3 } from "../../core/math/vec3.js";
import { BufferView } from "../../core/render/gfx/BufferView.js";
import { UBO } from "../../core/render/pipeline/UBO.js";
import { Scene } from "../../core/render/Scene.js";

const Block = {
    type: DescriptorType.UNIFORM_BUFFER,
    stageFlags: ShaderStageFlagBits.FRAGMENT,
    members: {
        direction: {}
    }
}

const BlockSize = 3 * Float32Array.BYTES_PER_ELEMENT;

const vec3_a = vec3.create();

export class LightUBO extends UBO {

    static readonly definition = Block;

    private _view: BufferView = new BufferView('f32', BufferUsageFlagBits.UNIFORM, BlockSize);
    get buffer(): Buffer {
        return this._view.buffer;
    }

    upload(scene: Scene, commandBuffer: CommandBuffer, dumping: boolean): void {
        const light = scene.directionalLight!;

        if (dumping || light.transform.hasChangedFlag.value) {
            vec3.transformQuat(vec3_a, vec3.FORWARD, light.transform.world_rotation);
            vec3.negate(vec3_a, vec3_a);
            this._view.set(vec3_a, 0);
            this._view.update(commandBuffer);
        }
    }
}