import { CommandBuffer, Pipeline, RenderPass } from "gfx";
import { Zero } from "../../core/Zero.js";
import { Context } from "../../core/render/pipeline/Context.js";
import { Phase } from "../../core/render/pipeline/Phase.js";
import { Profile } from "../../core/render/pipeline/Profile.js";
import { InstanceBatch } from "../../core/render/scene/InstanceBatch.js";
import { Model } from "../../core/render/scene/Model.js";
import { Pass } from "../../core/render/scene/Pass.js";
import { SubMesh } from "../../core/render/scene/SubMesh.js";
import { shaderLib } from "../../core/shaderLib.js";

interface PB {
    pass: Pass,
    batch: InstanceBatch
}

const batchCache = (function () {
    const subMesh2batches: WeakMap<SubMesh, InstanceBatch[]> = new WeakMap;
    const batch2pass: WeakMap<InstanceBatch, Pass> = new WeakMap;
    return function (pass: Pass, model: Model, subMeshIndex: number): InstanceBatch {
        const subMesh = model.mesh.subMeshes[subMeshIndex];
        let batches = subMesh2batches.get(subMesh);
        if (!batches) {
            subMesh2batches.set(subMesh, batches = []);
        }
        let batch: InstanceBatch | undefined;
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
            batch = model.batch(subMeshIndex);
            batches.push(batch);
            batch2pass.set(batch, pass);
        }
        return batch;
    }
})();

function compareModel(a: Model, b: Model) {
    return a.order - b.order;
}

type Culling = 'View' | 'CSM';

export class ModelPhase extends Phase {
    private _pb_buffer: PB[] = [];
    private _pb_count: number = 0;

    constructor(
        context: Context,
        visibility: number,
        public culling: Culling = 'View',
        /**The model type that indicates which models should run in this phase */
        private _model = 'default',
        /**The pass type that indicates which passes should run in this phase */
        private _pass = 'default',
    ) {
        super(context, visibility);
    }

    update(commandBuffer: CommandBuffer): void {
        const data = Zero.instance.pipeline.data;

        let models: Iterable<Model>;
        switch (this.culling) {
            case 'View':
                models = data.culling?.getView(data.current_camera).camera || Zero.instance.scene.models;
                break;
            case 'CSM':
                models = data.culling?.getView(data.current_camera).shadow[data.flowLoopIndex] || Zero.instance.scene.models;
                break;
            default:
                throw new Error(`unsupported culling: ${this.culling}`);
        }

        const modelQueue: Model[] = [];
        for (const model of models) {
            if (model.type == this._model) {
                modelQueue.push(model);
            }
        }
        modelQueue.sort(compareModel);

        this._pb_count = 0;
        const pass2batches: Map<Pass, InstanceBatch[]> = new Map;
        let pass2batches_order: number = 0;
        for (const model of models) {
            model.upload(commandBuffer);

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
                                    this._pb_buffer[this._pb_count].pass = pass;
                                    this._pb_buffer[this._pb_count].batch = batch;
                                } else {
                                    this._pb_buffer.push({ pass, batch });
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
                    model.batchUpdate(batch)
                }
            }

            pass2batches_order = model.order;
        }
        for (const [pass, batches] of pass2batches) {
            for (const batch of batches) {
                if (this._pb_buffer.length > this._pb_count) {
                    this._pb_buffer[this._pb_count].pass = pass;
                    this._pb_buffer[this._pb_count].batch = batch;
                } else {
                    this._pb_buffer.push({ pass, batch });
                }
                this._pb_count++;
            }
        }
        for (let i = 0; i < this._pb_count; i++) {
            const { pass, batch } = this._pb_buffer[i];
            pass.upload(commandBuffer);
            batch.upload(commandBuffer);
        }
    }

    render(profile: Profile, commandBuffer: CommandBuffer, renderPass: RenderPass) {
        let current_pass: Pass | undefined;
        let current_pipeline: Pipeline | undefined;
        for (let i = 0; i < this._pb_count; i++) {
            const { pass, batch } = this._pb_buffer[i];
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
            } else {
                commandBuffer.draw(batch.draw.count, batch.draw.first, batch.count);
            }
            profile.draws++;

            batch.recycle();
        }
    }
}
ModelPhase.InstanceBatch = InstanceBatch;

export declare namespace ModelPhase {
    export { Culling, InstanceBatch }
}