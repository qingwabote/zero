import { Component } from "../../core/Component.js";
import { Zero } from "../../core/Zero.js";
import { Model } from "../../core/render/scene/Model.js";

export abstract class ModelRenderer extends Component {
    protected _model: Model | null = null;

    update(dt: number): void {
        if (!this._model) {
            (this._model = this.createModel()) && Zero.instance.scene.addModel(this._model);
        }
    }

    protected abstract createModel(): Model | null;
}