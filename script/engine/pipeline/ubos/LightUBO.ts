import { Buffer, BufferUsageFlagBits, DescriptorType, ShaderStageFlagBits } from "gfx";
import { Zero } from "../../core/Zero.js";
import { vec3 } from "../../core/math/vec3.js";
import { BufferView } from "../../core/render/BufferView.js";
import { UBO } from "../../core/render/pipeline/UBO.js";

const LightBlock = {
    type: DescriptorType.UNIFORM_BUFFER,
    stageFlags: ShaderStageFlagBits.FRAGMENT,
    members: {
        direction: {}
    },
    size: 3 * Float32Array.BYTES_PER_ELEMENT
}

const vec3_a = vec3.create();

export class LightUBO extends UBO {
    static readonly definition = LightBlock;

    private _view: BufferView = new BufferView("Float32", BufferUsageFlagBits.UNIFORM, LightBlock.size);
    get buffer(): Buffer {
        return this._view.buffer;
    }

    private _dirty = true;

    update(): void {
        const light = Zero.instance.scene.directionalLight!;

        if (this._dirty || light.transform.hasChanged) {
            vec3.transformQuat(vec3_a, vec3.FORWARD, light.transform.world_rotation);
            vec3.negate(vec3_a, vec3_a);
            this._view.set(vec3_a, 0);
            this._view.update();

            this._dirty = false;
        }
    }
}