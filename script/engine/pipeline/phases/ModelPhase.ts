import { CommandBuffer, RenderPass } from "gfx";
import { Zero } from "../../core/Zero.js";
import { Context } from "../../core/render/pipeline/Context.js";
import { Culler } from "../../core/render/pipeline/Culling.js";
import { Drawer } from "../../core/render/pipeline/Drawer.js";
import { Phase } from "../../core/render/pipeline/Phase.js";
import { Profile } from "../../core/render/pipeline/Profile.js";
import { Model } from "../../core/render/scene/Model.js";

function modelCompareFn(a: Model, b: Model) {
    return a.order - b.order;
}

export class ModelPhase extends Phase {
    constructor(
        context: Context,
        visibility: number,
        public culler: Culler,
        private _drawer: Drawer,
        /**The model type that indicates which models should run in this phase */
        private _model = 'default',
        /**The pass type that indicates which passes should run in this phase */
        private _pass = 'default',
    ) {
        super(context, visibility);
    }

    record(profile: Profile, commandBuffer: CommandBuffer, renderPass: RenderPass, cameraIndex: number) {
        profile.emit(Profile.Event.CULL_START);
        const models = this.culler.cull(Zero.instance.scene.models, this._model, cameraIndex);
        profile.emit(Profile.Event.CULL_END);
        models.sort(modelCompareFn);

        profile.draws += this._drawer.record(this._context, commandBuffer, renderPass, this._pass, models);
    }
}