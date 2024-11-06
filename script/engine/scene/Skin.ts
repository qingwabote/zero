import { device } from "boot";
import { CommandBuffer, DescriptorSet, DescriptorSetLayout, Filter } from "gfx";
import { Mat4Like } from "../core/math/mat4.js";
import { TextureView } from "../core/render/gpu/TextureView.js";
import { Periodic } from "../core/render/scene/Periodic.js";
import { Transform } from "../core/render/scene/Transform.js";
import { getSampler } from "../core/sc.js";
import { shaderLib } from "../core/shaderLib.js";
import { SkinInstance } from "./SkinInstance.js";

const SkinUniform = shaderLib.sets.batch.uniforms.Skin;

const META_LENGTH = 1 /* pixels */ * 4 /* RGBA */;

const descriptorSetLayout: DescriptorSetLayout = shaderLib.createDescriptorSetLayout([SkinUniform]);

class Batch {
    private _countFlag = new Periodic(0, 0);
    get count(): number {
        return this._countFlag.value;
    }

    readonly descriptorSet: DescriptorSet;

    private readonly _view: TextureView;

    constructor(joints_per_instance: number) {
        const view = new TextureView(META_LENGTH);
        view.source[0] = 3 * joints_per_instance;
        const descriptorSet = device.createDescriptorSet(descriptorSetLayout);
        descriptorSet.bindTexture(SkinUniform.binding, view.texture, getSampler(Filter.NEAREST, Filter.NEAREST));
        this.descriptorSet = descriptorSet;
        this._view = view;
    }

    add(joints: ArrayLike<number>) {
        if (this._countFlag.value == 0) {
            this._view.reset();
        }

        this._view.add(joints)

        return this._countFlag.value++;
    }

    upload(commandBuffer: CommandBuffer) {
        this._view.update(commandBuffer);
    }
}

export class Skin {
    private _batch?: Batch = undefined;
    get batch() {
        if (!this._batch) {
            this._batch = new Batch(this.joints.length);
        }
        return this._batch;
    }

    constructor(
        readonly inverseBindMatrices: readonly Readonly<Mat4Like>[],
        readonly joints: readonly (readonly string[])[]
    ) { }

    instantiate(root: Transform): SkinInstance {
        return new SkinInstance(root, this);
    }
}