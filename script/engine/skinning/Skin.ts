import { device } from "boot";
import { CommandBuffer, DescriptorSet, Filter } from "gfx";
import { pk } from "puttyknife";
import { TextureView } from "../core/render/gfx/TextureView.js";
import { Transform } from "../core/render/scene/Transform.js";
import { Transient } from "../core/render/scene/Transient.js";
import { getSampler } from "../core/sc.js";
import { shaderLib } from "../core/shaderLib.js";
import { SkinInstance } from "./SkinInstance.js";

const jointMap = shaderLib.sets.local.uniforms.jointMap;

class Store {
    static readonly descriptorSetLayout = shaderLib.createDescriptorSetLayout([jointMap]);

    public readonly descriptorSet: DescriptorSet;

    protected readonly _view: TextureView;

    public get handle() {
        return this._view.handle;
    }

    constructor(protected readonly _stride: number) {
        const view = new TextureView;
        const descriptorSet = device.createDescriptorSet(Store.descriptorSetLayout);
        descriptorSet.bindTexture(jointMap.binding, view.texture, getSampler(Filter.NEAREST, Filter.NEAREST));
        this.descriptorSet = descriptorSet;
        this._view = view;
    }

    add(): number {
        return this._view.addBlock(4 * 3 * this._stride);
    }

    invalidate(offset: number) {
        this._view.invalidate(offset, 4 * 3 * this._stride);
    }

    upload(commandBuffer: CommandBuffer) {
        this._view.update(commandBuffer);
    }
}

class TransientStore extends Store {
    private readonly _reset = new Transient(0, 0);

    override add() {
        if (this._reset.value == 0) {
            this._view.reset();
            this._reset.value = 1;
        }

        return super.add();
    }
}

export class Skin {
    private _transient?: TransientStore = undefined;
    get transient() {
        if (!this._transient) {
            this._transient = new TransientStore(this.joints.length);
        }
        return this._transient;
    }

    private _persistent?: Store = undefined;
    public get persistent(): Store {
        if (!this._persistent) {
            this._persistent = new Store(this.joints.length);
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
Skin.Store = Store;

export declare namespace Skin {
    export { Store }
}