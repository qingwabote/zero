import { Buffer, BufferUsageFlagBits, CommandBuffer, DescriptorType, ShaderStageFlagBits } from "gfx";
import { vec3 } from "../../core/math/vec3.js";
import { Context } from "../../core/render/Context.js";
import { BufferView } from "../../core/render/gfx/BufferView.js";
import { UBO } from "../../core/render/pipeline/UBO.js";

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

    upload(context: Context, commandBuffer: CommandBuffer, dumping: boolean): void {
        const light = context.scene.directionalLight!;

        if (dumping || light.transform.hasChangedFlag.value) {
            vec3.transformQuat(vec3_a, vec3.FORWARD, light.transform.world_rotation);
            vec3.negate(vec3_a, vec3_a);
            this._view.set(vec3_a, 0);
            this._view.update(commandBuffer);
        }
    }
}