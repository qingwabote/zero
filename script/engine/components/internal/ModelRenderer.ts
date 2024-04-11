import { Component } from "../../core/Component.js";
import { Zero } from "../../core/Zero.js";
import { Model } from "../../core/render/scene/Model.js";

export abstract class ModelRenderer extends Component {
    protected _model: Model | null = null;

    private _type: string = 'default';
    public get type(): string {
        return this._type;
    }
    public set type(value: string) {
        this._type = value;
    }

    private _order: number = 0;
    public get order(): number {
        return this._order;
    }
    public set order(value: number) {
        this._order = value;
    }

    update(dt: number): void {
        if (!this._model) {
            (this._model = this.createModel()) && Zero.instance.scene.addModel(this._model);
        }

        if (this._model) {
            this._model.type = this._type;
            this._model.order = this._order;
        }
    }

    protected abstract createModel(): Model | null;
}