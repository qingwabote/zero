import { device } from "boot";
import { Filter } from "gfx";
import { TextureView } from "../core/render/gpu/TextureView.js";
import { Periodic } from "../core/render/scene/Periodic.js";
import { getSampler } from "../core/sc.js";
import { shaderLib } from "../core/shaderLib.js";
import { SkinInstance } from "./SkinInstance.js";
const SkinUniform = shaderLib.sets.batch.uniforms.Skin;
const descriptorSetLayout = shaderLib.createDescriptorSetLayout([SkinUniform]);
class JointStore {
    constructor(_stride) {
        this._stride = _stride;
        const view = new TextureView;
        const descriptorSet = device.createDescriptorSet(descriptorSetLayout);
        descriptorSet.bindTexture(SkinUniform.binding, view.texture, getSampler(Filter.NEAREST, Filter.NEAREST));
        this.descriptorSet = descriptorSet;
        this._view = view;
    }
    upload(commandBuffer) {
        this._view.update(commandBuffer);
    }
}
class JointAlive extends JointStore {
    constructor() {
        super(...arguments);
        this._reset = new Periodic(0, 0);
    }
    add() {
        if (this._reset.value == 0) {
            this._view.reset();
            this._reset.value = 1;
        }
        return this._view.addBlock(4 * 3 * this._stride);
    }
}
class JointBaked extends JointStore {
    add() {
        return this._view.addBlock(4 * 3 * this._stride);
    }
}
export class Skin {
    get alive() {
        if (!this._alive) {
            this._alive = new JointAlive(this.joints.length);
        }
        return this._alive;
    }
    get baked() {
        if (!this._baked) {
            this._baked = new JointBaked(this.joints.length);
        }
        return this._baked;
    }
    constructor(inverseBindMatrices, joints, jointData) {
        this.inverseBindMatrices = inverseBindMatrices;
        this.joints = joints;
        this.jointData = jointData;
        this._alive = undefined;
        this._baked = undefined;
    }
    instantiate(root) {
        return new SkinInstance(this, root);
    }
}
