import { CachedFactory, empty } from "bastard";
import { BufferUsageFlagBits, Format, VertexAttribute } from "gfx";
import { BufferView } from "../../core/render/gpu/BufferView.js";
import { Phase } from "../../core/render/pipeline/Phase.js";
import { Profile } from "../../core/render/pipeline/Profile.js";
import { Periodic } from "../../core/render/scene/Periodic.js";
import { gfxUtil } from "../../gfxUtil.js";
class InstancedBatch {
    get uploaded() {
        return this._uploadFlag.value != 0;
    }
    get count() {
        return this._countFlag.value;
    }
    constructor(subMesh, attributes, descriptorSet) {
        this.descriptorSet = descriptorSet;
        this._uploadFlag = new Periodic(0, 0);
        this._countFlag = new Periodic(0, 0);
        const ia = gfxUtil.cloneInputAssembler(subMesh.inputAssembler);
        const attributeViews = {};
        for (const attr of attributes) {
            const attribute = new VertexAttribute;
            attribute.location = attr.location;
            attribute.format = attr.format;
            attribute.multiple = attr.multiple || 1;
            attribute.buffer = ia.vertexInput.buffers.size();
            attribute.instanced = true;
            ia.vertexInputState.attributes.add(attribute);
            let view;
            switch (attr.format) {
                case Format.R16_UINT:
                    view = new BufferView('Uint16', BufferUsageFlagBits.VERTEX);
                    break;
                case Format.R32_UINT:
                    view = new BufferView('Uint32', BufferUsageFlagBits.VERTEX);
                    break;
                case Format.RGBA32_SFLOAT:
                    view = new BufferView('Float32', BufferUsageFlagBits.VERTEX);
                    break;
                default:
                    throw new Error(`unsupported attribute format: ${attr.format}`);
            }
            ia.vertexInput.buffers.add(view.buffer);
            ia.vertexInput.offsets.add(0);
            attributeViews[attr.location] = view;
        }
        this.attributes = attributeViews;
        this.inputAssembler = ia;
        this.draw = subMesh.draw;
        this.descriptorSetLayout = descriptorSet === null || descriptorSet === void 0 ? void 0 : descriptorSet.layout;
    }
    next() {
        this._countFlag.value++;
    }
    upload(commandBuffer) {
        for (const key in this.attributes) {
            this.attributes[key].update(commandBuffer);
        }
        this._uploadFlag.value = 1;
    }
    reset() {
        for (const key in this.attributes) {
            this.attributes[key].reset();
        }
    }
}
const cache_keys = [undefined, undefined];
const cache = new CachedFactory(function () { return []; }, true);
function compareModel(a, b) {
    return a.order - b.order;
}
export class ModelPhase extends Phase {
    constructor(visibility, _flowLoopIndex, _data, _culling = 'View', 
    /**The model type that indicates which models should run in this phase */
    _model = 'default', 
    /**The pass type that indicates which passes should run in this phase */
    _pass = 'default') {
        super(visibility);
        this._flowLoopIndex = _flowLoopIndex;
        this._data = _data;
        this._culling = _culling;
        this._model = _model;
        this._pass = _pass;
    }
    batch(out, context, commandBuffer, cameraIndex) {
        var _a, _b;
        let models;
        switch (this._culling) {
            case 'View':
                models = ((_a = this._data.culling) === null || _a === void 0 ? void 0 : _a.getView(context.scene.cameras[cameraIndex]).camera) || context.scene.models;
                break;
            case 'CSM':
                models = ((_b = this._data.culling) === null || _b === void 0 ? void 0 : _b.getView(context.scene.cameras[cameraIndex]).shadow[this._flowLoopIndex]) || context.scene.models;
                break;
            default:
                throw new Error(`unsupported culling: ${this._culling}`);
        }
        const modelQueue = [];
        for (const model of models) {
            if (model.type == this._model) {
                modelQueue.push(model);
            }
        }
        modelQueue.sort(compareModel);
        let pass2batches = out.push();
        let pass2batches_order = 0; // The models with smaller order value will be draw first, but the models with the same order value may not be draw by their access order for better batching 
        const batch2pass = new Map;
        for (const model of modelQueue) {
            const diff = model.order - pass2batches_order;
            for (let i = 0; i < model.mesh.subMeshes.length; i++) {
                if (model.mesh.subMeshes[i].draw.count == 0) {
                    continue;
                }
                for (const pass of model.materials[i].passes) {
                    if (pass.type != this._pass) {
                        continue;
                    }
                    if (diff) {
                        const batches = pass2batches.get(pass);
                        if (diff == 1 && batches) { // moving to next 
                            pass2batches.delete(pass);
                        }
                        context.profile.emit(Profile.Event.BATCH_UPLOAD_START);
                        for (const [pass, batches] of pass2batches) {
                            pass.upload(commandBuffer);
                            for (const batch of batches) {
                                batch.upload(commandBuffer);
                            }
                        }
                        context.profile.emit(Profile.Event.BATCH_UPLOAD_END);
                        pass2batches = out.push();
                        if (diff == 1 && batches) { // moved to next
                            pass2batches.set(pass, batches);
                        }
                    }
                    let batches = pass2batches.get(pass);
                    if (!batches) {
                        pass2batches.set(pass, batches = []);
                    }
                    let batch;
                    cache_keys[0] = model.mesh.subMeshes[i];
                    cache_keys[1] = model.descriptorSet || empty.obj;
                    const bucket = cache.get(cache_keys);
                    for (const bat of bucket) {
                        if (bat.uploaded) {
                            continue;
                        }
                        const p = batch2pass.get(bat);
                        if (p && p != pass) {
                            continue;
                        }
                        batch = bat;
                        break;
                    }
                    if (!batch) {
                        batch = new InstancedBatch(model.mesh.subMeshes[i], model.constructor.attributes, model.descriptorSet);
                        bucket.push(batch);
                    }
                    if (batch.count == 0) {
                        batch.reset();
                        batches.push(batch);
                    }
                    model.upload(batch.attributes);
                    batch.next();
                    batch2pass.set(batch, pass);
                }
            }
            pass2batches_order = model.order;
        }
        context.profile.emit(Profile.Event.BATCH_UPLOAD_START);
        for (const [pass, batches] of pass2batches) {
            pass.upload(commandBuffer);
            for (const batch of batches) {
                batch.upload(commandBuffer);
            }
        }
        context.profile.emit(Profile.Event.BATCH_UPLOAD_END);
    }
}
