import { Buffer, BufferUsageFlagBits, DescriptorType, ShaderStageFlagBits } from "gfx";
import { Zero } from "../../core/Zero.js";
import { BufferView } from "../../core/render/BufferView.js";
import { Parameters } from "../../core/render/pipeline/Parameters.js";
import { UBO } from "../../core/render/pipeline/UBO.js";

const Block = {
    type: DescriptorType.UNIFORM_BUFFER_DYNAMIC,
    stageFlags: ShaderStageFlagBits.VERTEX | ShaderStageFlagBits.FRAGMENT,
    members: {
        viewProj: {
            offset: 0
        }
    },
    size: UBO.align((16 * 3 + 1) * Float32Array.BYTES_PER_ELEMENT),
}

export class LightFrustaUBO extends UBO {
    static readonly definition = Block;

    private _view: BufferView = new BufferView("Float32", BufferUsageFlagBits.UNIFORM);
    get buffer(): Buffer {
        return this._view.buffer;
    }

    get range(): number {
        return Block.size;
    }

    override dynamicOffset(params: Parameters): number {
        const light = Zero.instance.scene.directionalLight!;
        return Block.size * light.shadows[params.cameraIndex].index;
    }

    update(): void {
        const light = Zero.instance.scene.directionalLight!;

        this._view.resize(Block.size * light.shadow_cameras.length / this._view.source.BYTES_PER_ELEMENT);

        for (let i = 0; i < light.shadow_cameras.length; i++) {
            const shadow = light.shadows[light.shadow_cameras[i]];
            if (shadow.hasChanged) {
                const offset = (Block.size / this._view.source.BYTES_PER_ELEMENT) * i;
                this._view.set(shadow.viewProj, offset + Block.members.viewProj.offset);
            }
        }
        this._view.update();
    }

}