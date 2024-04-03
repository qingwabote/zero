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

export class LightUBO extends UBO {
    static readonly definition = LightBlock;

    private _view: BufferView = new BufferView("Float32", BufferUsageFlagBits.UNIFORM, LightBlock.size);
    get buffer(): Buffer {
        return this._view.buffer;
    }

    private _dirty = true;

    update(): void {
        const light = Zero.instance.scene.directionalLight!;

        if (this._dirty || light.hasChanged || light.transform.hasChanged) {
            const lightSrcDir = vec3.normalize(vec3.create(), light.transform.world_position);
            this._view.set(lightSrcDir, 0);
            this._view.update();

            this._dirty = false;
        }
    }
}