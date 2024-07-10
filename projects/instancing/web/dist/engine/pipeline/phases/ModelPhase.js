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
function modelCompareFn(a, b) {
    return a.order - b.order;
}
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
        if (this._batching) {
            const pass2batches = new Map;
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
                        let batches = pass2batches.get(pass);
                        if (!batches) {
                            pass2batches.set(pass, batches = []);
                        }
                        // fallback
                        if (model.descriptorSet) {
                            batches.push(singleCache(model, i));
                            continue;
                        }
                        const multiple = multipleCache(model.mesh.subMeshes[i]);
                        if (multiple.count == 0) {
                            batches.push(multiple);
                        }
                        multiple.add(model.transform.world_matrix);
                    }
                }
            }
            for (const [pass, batches] of pass2batches) {
                pass.upload();
                if (pass.descriptorSet) {
                    commandBuffer.bindDescriptorSet(shaderLib.sets.material.index, pass.descriptorSet);
                }
                for (const batch of batches) {
                    batch.record(profile, commandBuffer, renderPass, this._context, pass);
                }
                profile.passes++;
            }
        }
        else {
            models = [...models].sort(modelCompareFn);
            const passes = [];
            const batches = [];
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
                        batches.push(singleCache(model, i));
                        passes.push(pass);
                    }
                }
            }
            let current_pass;
            for (let i = 0; i < batches.length; i++) {
                const pass = passes[i];
                if (current_pass != pass) {
                    pass.upload();
                    if (pass.descriptorSet) {
                        commandBuffer.bindDescriptorSet(shaderLib.sets.material.index, pass.descriptorSet);
                    }
                    current_pass = pass;
                    profile.passes++;
                }
                batches[i].record(profile, commandBuffer, renderPass, this._context, pass);
            }
        }
    }
}
ModelPhase.InstanceBatch = InstanceBatch;
