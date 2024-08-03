import { RecyclePool } from "bastard";
import { Zero } from "../../core/Zero.js";
import { Phase } from "../../core/render/pipeline/Phase.js";
import { shaderLib } from "../../core/shaderLib.js";
import { InstanceBatch } from "./internal/InstanceBatch.js";
const singleCache = (function () {
    const model2singles = new WeakMap;
    return function (model, subIndex) {
        let batches = model2singles.get(model);
        if (!batches) {
            model2singles.set(model, batches = []);
        }
        let batch = batches[subIndex];
        if (!batch) {
            batch = batches[subIndex] = new InstanceBatch.Single(model, subIndex);
        }
        return batch;
    };
})();
const multipleCache = (function () {
    const subMesh2multiples = new WeakMap;
    return function (subMesh) {
        let multiples = subMesh2multiples.get(subMesh);
        if (!multiples) {
            subMesh2multiples.set(subMesh, multiples = []);
        }
        let multiple = multiples.find(multiple => !multiple.locked);
        if (!multiple) {
            multiple = new InstanceBatch.Multiple(subMesh);
            multiples.push(multiple);
        }
        return multiple;
    };
})();
const pmQueueBuilder = (function () {
    const pass2batches = new Map;
    const pb = { pass: null, batch: null };
    return {
        add: function (pass, model, subIndex) {
            let batches = pass2batches.get(pass);
            if (!batches) {
                pass2batches.set(pass, batches = []);
            }
            // fallback
            if (model.descriptorSet) {
                batches.push(singleCache(model, subIndex));
                return;
            }
            const multiple = multipleCache(model.mesh.subMeshes[subIndex]);
            if (multiple.count == 0) {
                batches.push(multiple);
            }
            multiple.add(model.transform.world_matrix);
        },
        dump: function* () {
            for (const [pass, batches] of pass2batches) {
                for (const batch of batches) {
                    pb.pass = pass;
                    pb.batch = batch;
                    yield pb;
                }
            }
            pass2batches.clear();
        }
    };
})();
const psQueueBuilder = (function () {
    function compareFn(a, b) {
        return a.batch.model.order - b.batch.model.order || a.pass.id - b.pass.id;
    }
    const pool = new RecyclePool(() => { return { pass: null, batch: null }; });
    const queue = [];
    return {
        add: function (pass, model, subIndex) {
            const pb = pool.get();
            pb.pass = pass;
            pb.batch = singleCache(model, subIndex);
            queue.push(pb);
        },
        dump: function* () {
            queue.sort(compareFn);
            yield* queue;
            pool.recycle();
            queue.length = 0;
        }
    };
})();
export class ModelPhase extends Phase {
    constructor(context, visibility, culling = 'View', _batching = false, 
    /**The model type that indicates which models should run in this phase */
    _model = 'default', 
    /**The pass type that indicates which passes should run in this phase */
    _pass = 'default') {
        super(context, visibility);
        this.culling = culling;
        this._batching = _batching;
        this._model = _model;
        this._pass = _pass;
    }
    record(profile, commandBuffer, renderPass) {
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
        const pbQueueBuilder = this._batching ? pmQueueBuilder : psQueueBuilder;
        for (const model of models) {
            if (model.type != this._model) {
                continue;
            }
            model.upload();
            for (let i = 0; i < model.mesh.subMeshes.length; i++) {
                if (model.mesh.subMeshes[i].draw.count == 0) {
                    continue;
                }
                for (const pass of model.materials[i].passes) {
                    if (pass.type != this._pass) {
                        continue;
                    }
                    pbQueueBuilder.add(pass, model, i);
                }
            }
        }
        let current_pass;
        let current_pipeline;
        for (const { pass, batch } of pbQueueBuilder.dump()) {
            if (current_pass != pass) {
                pass.upload();
                if (pass.descriptorSet) {
                    commandBuffer.bindDescriptorSet(shaderLib.sets.material.index, pass.descriptorSet);
                }
                current_pass = pass;
                profile.passes++;
            }
            batch.upload();
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
