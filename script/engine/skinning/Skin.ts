import { device } from "boot";
import { CommandBuffer, DescriptorSet, DescriptorSetLayout, Filter } from "gfx";
import { pk } from "puttyknife";
import { TextureView } from "../core/render/gpu/TextureView.js";
import { Periodic } from "../core/render/scene/Periodic.js";
import { Transform } from "../core/render/scene/Transform.js";
import { getSampler } from "../core/sc.js";
import { shaderLib } from "../core/shaderLib.js";
import { SkinInstance } from "./SkinInstance.js";

const SkinUniform = shaderLib.sets.batch.uniforms.Skin;

const descriptorSetLayout: DescriptorSetLayout = shaderLib.createDescriptorSetLayout([SkinUniform]);

abstract class JointStore {
    readonly descriptorSet: DescriptorSet;

    protected readonly _view: TextureView;

    constructor(protected readonly _stride: number) {
        const view = new TextureView;
        const descriptorSet = device.createDescriptorSet(descriptorSetLayout);
        descriptorSet.bindTexture(SkinUniform.binding, view.texture, getSampler(Filter.NEAREST, Filter.NEAREST));
        this.descriptorSet = descriptorSet;
        this._view = view;
    }

    abstract add(): readonly [{ [index: number]: number }, number];

    upload(commandBuffer: CommandBuffer) {
        this._view.update(commandBuffer);
    }
}

class JointAlive extends JointStore {
    private readonly _reset = new Periodic(0, 0);

    add() {
        if (this._reset.value == 0) {
            this._view.reset();
            this._reset.value = 1;
        }

        return this._view.addBlock(4 * 3 * this._stride)
    }
}

class JointBaked extends JointStore {
    add() {
        return this._view.addBlock(4 * 3 * this._stride)
    }
}

export class Skin {
    private _alive?: JointAlive = undefined;
    get alive() {
        if (!this._alive) {
            this._alive = new JointAlive(this.joints.length);
        }
        return this._alive;
    }

    private _baked?: JointBaked = undefined;
    public get baked(): JointBaked {
        if (!this._baked) {
            this._baked = new JointBaked(this.joints.length);
        }
        return this._baked;
    }

    constructor(
        readonly inverseBindMatrices: readonly Readonly<pk.BufferHandle>[],
        readonly joints: readonly (readonly string[])[],
        readonly jointData: Float32Array
    ) { }

    instantiate(root: Transform): SkinInstance {
        return new SkinInstance(this, root);
    }
}

export declare namespace Skin {
    export type { JointStore }
}