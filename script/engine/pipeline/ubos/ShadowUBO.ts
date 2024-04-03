import { Buffer, BufferUsageFlagBits, DescriptorType, ShaderStageFlagBits } from "gfx";
import { Zero } from "../../core/Zero.js";
import { mat4 } from "../../core/math/mat4.js";
import { BufferView } from "../../core/render/BufferView.js";
import { Parameters } from "../../core/render/pipeline/Parameters.js";
import { UBO } from "../../core/render/pipeline/UBO.js";

const ShadowBlock = {
    type: DescriptorType.UNIFORM_BUFFER_DYNAMIC,
    stageFlags: ShaderStageFlagBits.VERTEX | ShaderStageFlagBits.FRAGMENT,
    members: {
        view: {
            offset: 0
        },
        projection: {
            offset: 16
        }
    },
    size: UBO.align((16 + 16) * Float32Array.BYTES_PER_ELEMENT),
}

const mat4_a = mat4.create();

export class ShadowUBO extends UBO {
    static readonly definition = ShadowBlock;

    private _view: BufferView = new BufferView("Float32", BufferUsageFlagBits.UNIFORM, ShadowBlock.size);
    get buffer(): Buffer {
        return this._view.buffer;
    }

    override dynamicOffset(params: Parameters): number {
        const light = Zero.instance.scene.directionalLight!;
        return ShadowBlock.size * light.shadows[params.cameraIndex].index;
    }

    override use(): void {
        const light = Zero.instance.scene.directionalLight!;
        const cameras = Zero.instance.scene.cameras;
        const indexes: number[] = []
        for (let i = 0; i < cameras.length; i++) {
            if (cameras[i].visibilities & this.visibilities) {
                indexes.push(i);
            }
        }
        light.shadow_cameras = indexes;
    }

    update(): void {
        const light = Zero.instance.scene.directionalLight!;

        this._view.resize(ShadowBlock.size * light.shadow_cameras.length / this._view.source.BYTES_PER_ELEMENT);

        for (let i = 0; i < light.shadow_cameras.length; i++) {
            const shadow = light.shadows[light.shadow_cameras[i]];
            if (shadow.hasChanged) {
                const offset = (ShadowBlock.size / this._view.source.BYTES_PER_ELEMENT) * i;

                mat4.invert(mat4_a, shadow.model);
                this._view.set(mat4_a, offset + ShadowBlock.members.view.offset);
                this._view.set(shadow.proj, offset + ShadowBlock.members.projection.offset);
                this._view.update();
            }
        }
    }

}