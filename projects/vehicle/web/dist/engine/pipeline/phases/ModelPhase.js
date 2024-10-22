import { device } from "boot";
import { DescriptorSetLayoutInfo, InputAssembler, VertexAttribute } from "gfx";
import { Zero } from "../../core/Zero.js";
import { Phase } from "../../core/render/pipeline/Phase.js";
import { PeriodicFlag } from "../../core/render/scene/PeriodicFlag.js";
import { shaderLib } from "../../core/shaderLib.js";
const inputAssembler_clone = (function () {
    function vertexInput_clone(out, vertexInput) {
        const buffers = vertexInput.buffers;
        const buffers_size = buffers.size();
        for (let i = 0; i < buffers_size; i++) {
            out.buffers.add(buffers.get(i));
        }
        const offsets = vertexInput.offsets;
        const offsets_size = offsets.size();
        for (let i = 0; i < offsets_size; i++) {
            out.offsets.add(offsets.get(i));
        }
        return out;
    }
    return function (inputAssembler) {
        const out = new InputAssembler;
        const vertexAttributes = inputAssembler.vertexInputState.attributes;
        const size = vertexAttributes.size();
        for (let i = 0; i < size; i++) {
            out.vertexInputState.attributes.add(vertexAttributes.get(i));
        }
        out.vertexInputState.primitive = inputAssembler.vertexInputState.primitive;
        vertexInput_clone(out.vertexInput, inputAssembler.vertexInput);
        if (inputAssembler.indexInput) {
            out.indexInput = inputAssembler.indexInput;
        }
        return out;
    };
})();
const descriptorSetLayoutNull = device.createDescriptorSetLayout(new DescriptorSetLayoutInfo);
class InstanceBatch {
    get count() {
        return this._count;
    }
    get locked() {
        return this._lockFlag.value != 0;
    }
    constructor(inputAssembler, draw, vertexes, descriptorSetLayout = descriptorSetLayoutNull, descriptorSet, uniforms) {
        this.inputAssembler = inputAssembler;
        this.draw = draw;
        this.vertexes = vertexes;
        this.descriptorSetLayout = descriptorSetLayout;
        this.descriptorSet = descriptorSet;
        this.uniforms = uniforms;
        this._count = 0;
        this._lockFlag = new PeriodicFlag();
    }
    next() {
        this._count++;
    }
    upload(commandBuffer) {
        this.vertexes.update(commandBuffer);
        for (const key in this.uniforms) {
            this.uniforms[key].update(commandBuffer);
        }
    }
    recycle() {
        this.vertexes.reset();
        for (const key in this.uniforms) {
            this.uniforms[key].reset();
        }
        this._count = 0;
        this._lockFlag.reset(1);
    }
}
const batchCache = (function () {
    const subMesh2batches = new WeakMap;
    const batch2pass = new WeakMap;
    return function (pass, model, subMeshIndex) {
        var _a;
        const subMesh = model.mesh.subMeshes[subMeshIndex];
        let batches = subMesh2batches.get(subMesh);
        if (!batches) {
            subMesh2batches.set(subMesh, batches = []);
        }
        let batch;
        for (const b of batches) {
            if (b.locked) {
                continue;
            }
            const p = batch2pass.get(b);
            if (p && p != pass) {
                continue;
            }
            batch = b;
            break;
        }
        if (!batch) {
            const ia = inputAssembler_clone(subMesh.inputAssembler);
            const info = model.batch();
            for (const attr of info.attributes) {
                const attribute = new VertexAttribute;
                attribute.location = attr.location;
                attribute.format = attr.format;
                attribute.offset = attr.offset;
                attribute.multiple = attr.multiple;
                attribute.buffer = ia.vertexInput.buffers.size();
                attribute.instanced = true;
                ia.vertexInputState.attributes.add(attribute);
            }
            ia.vertexInput.buffers.add(info.vertexes.buffer);
            ia.vertexInput.offsets.add(0);
            batch = new InstanceBatch(ia, subMesh.draw, info.vertexes, (_a = info.descriptorSet) === null || _a === void 0 ? void 0 : _a.layout, info.descriptorSet, info.uniforms);
            batches.push(batch);
            batch2pass.set(batch, pass);
        }
        return batch;
    };
})();
function compareModel(a, b) {
    return a.order - b.order;
}
export class ModelPhase extends Phase {
    constructor(context, visibility, culling = 'View', 
    /**The model type that indicates which models should run in this phase */
    _model = 'default', 
    /**The pass type that indicates which passes should run in this phase */
    _pass = 'default') {
        super(context, visibility);
        this.culling = culling;
        this._model = _model;
        this._pass = _pass;
        this._pb_buffer = [];
        this._pb_count = 0;
    }
    update(commandBuffer) {
        var _a, _b;
        const data = Zero.instance.pipeline.data;
        let models;
        switch (this.culling) {
            case 'View':
                models = ((_a = data.culling) === null || _a === void 0 ? void 0 : _a.getView(data.current_camera).camera) || Zero.instance.scene.models;
                break;
            case 'CSM':
                models = ((_b = data.culling) === null || _b === void 0 ? void 0 : _b.getView(data.current_camera).shadow[data.flowLoopIndex]) || Zero.instance.scene.models;
                break;
            default:
                throw new Error(`unsupported culling: ${this.culling}`);
        }
        const modelQueue = [];
        for (const model of models) {
            if (model.type == this._model) {
                modelQueue.push(model);
            }
        }
        modelQueue.sort(compareModel);
        this._pb_count = 0;
        const pass2batches = new Map;
        let pass2batches_order = 0;
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
                        if (diff == 1 && batches) {
                            pass2batches.delete(pass);
                        }
                        for (const [pass, batches] of pass2batches) {
                            for (const batch of batches) {
                                if (this._pb_buffer.length > this._pb_count) {
                                    this._pb_buffer[this._pb_count][0] = pass;
                                    this._pb_buffer[this._pb_count][1] = batch;
                                }
                                else {
                                    this._pb_buffer.push([pass, batch]);
                                }
                                this._pb_count++;
                            }
                        }
                        pass2batches.clear();
                        if (diff == 1 && batches) {
                            pass2batches.set(pass, batches);
                        }
                    }
                    let batches = pass2batches.get(pass);
                    if (!batches) {
                        pass2batches.set(pass, batches = []);
                    }
                    const batch = batchCache(pass, model, i);
                    if (batch.count == 0) {
                        batches.push(batch);
                    }
                    model.batchFill(batch.vertexes, batch.uniforms);
                    batch.next();
                }
            }
            pass2batches_order = model.order;
        }
        for (const [pass, batches] of pass2batches) {
            for (const batch of batches) {
                if (this._pb_buffer.length > this._pb_count) {
                    this._pb_buffer[this._pb_count][0] = pass;
                    this._pb_buffer[this._pb_count][1] = batch;
                }
                else {
                    this._pb_buffer.push([pass, batch]);
                }
                this._pb_count++;
            }
        }
        for (let i = 0; i < this._pb_count; i++) {
            const [pass, batch] = this._pb_buffer[i];
            pass.upload(commandBuffer);
            batch.upload(commandBuffer);
        }
    }
    render(profile, commandBuffer, renderPass) {
        let current_pass;
        let current_pipeline;
        for (let i = 0; i < this._pb_count; i++) {
            const [pass, batch] = this._pb_buffer[i];
            if (current_pass != pass) {
                if (pass.descriptorSet) {
                    commandBuffer.bindDescriptorSet(shaderLib.sets.material.index, pass.descriptorSet);
                }
                current_pass = pass;
                profile.passes++;
            }
            if (batch.descriptorSet) {
                commandBuffer.bindDescriptorSet(shaderLib.sets.local.index, batch.descriptorSet);
            }
            const pipeline = this._context.getPipeline(pass.state, batch.inputAssembler.vertexInputState, renderPass, [pass.descriptorSetLayout, batch.descriptorSetLayout]);
            if (current_pipeline != pipeline) {
                commandBuffer.bindPipeline(pipeline);
                current_pipeline = pipeline;
                profile.pipelines++;
            }
            commandBuffer.bindInputAssembler(batch.inputAssembler);
            if (batch.inputAssembler.indexInput) {
                commandBuffer.drawIndexed(batch.draw.count, batch.draw.first, batch.count);
            }
            else {
                commandBuffer.draw(batch.draw.count, batch.draw.first, batch.count);
            }
            profile.draws++;
            batch.recycle();
        }
    }
}
ModelPhase.InstanceBatch = InstanceBatch;
