import { device } from "boot";
import { CommandBuffer, DescriptorSet, DescriptorSetLayout, Filter } from "gfx";
import { pk } from "puttyknife";
import { TextureView } from "../core/render/gfx/TextureView.js";
import { Transform } from "../core/render/scene/Transform.js";
import { Transient } from "../core/render/scene/Transient.js";
import { getSampler } from "../core/sc.js";
import { shaderLib } from "../core/shaderLib.js";
import { SkinInstance } from "./SkinInstance.js";

const SkinUniform = shaderLib.sets.batch.uniforms.Skin;

const descriptorSetLayout: DescriptorSetLayout = shaderLib.createDescriptorSetLayout([SkinUniform]);

abstract class JointStore {
    public readonly descriptorSet: DescriptorSet;

    protected readonly _view: TextureView;

    public get handle() {
        return this._view.handle;
    }

    // public get view() {
    //     return this._view.view;
    // }

    constructor(protected readonly _stride: number) {
        const view = new TextureView;
        const descriptorSet = device.createDescriptorSet(descriptorSetLayout);
        descriptorSet.bindTexture(SkinUniform.binding, view.texture, getSampler(Filter.NEAREST, Filter.NEAREST));
        this.descriptorSet = descriptorSet;
        this._view = view;
    }

    abstract add(): number;

    invalidate(offset: number) {
        this._view.invalidate(offset, 4 * 3 * this._stride);
    }

    upload(commandBuffer: CommandBuffer) {
        this._view.update(commandBuffer);
    }
}

class JointTransient extends JointStore {
    private readonly _reset = new Transient(0, 0);

    add() {
        if (this._reset.value == 0) {
            this._view.reset();
            this._reset.value = 1;
        }

        return this._view.addBlock(4 * 3 * this._stride)
    }
}

class JointPersistent extends JointStore {
    add() {
        return this._view.addBlock(4 * 3 * this._stride)
    }
}

export class Skin {
    private _transient?: JointTransient = undefined;
    get transient() {
        if (!this._transient) {
            this._transient = new JointTransient(this.joints.length);
        }
        return this._transient;
    }

    private _persistent?: JointPersistent = undefined;
    public get persistent(): JointPersistent {
        if (!this._persistent) {
            this._persistent = new JointPersistent(this.joints.length);
        }
        return this._persistent;
    }

    constructor(
        readonly inverseBindMatrices: readonly Readonly<pk.BufferHandle>[],
        readonly joints: readonly (readonly string[])[]
    ) { }

    instantiate(root: Transform): SkinInstance {
        return new SkinInstance(this, root);
    }
}

export declare namespace Skin {
    export type { JointStore }
}