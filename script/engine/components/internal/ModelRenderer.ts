import { Component } from "../../core/Component.js";
import { Node } from "../../core/Node.js";
import { Model } from "../../core/render/scene/Model.js";

export abstract class ModelRenderer extends Component {
    protected _model: Model;

    public get type(): string {
        return this._model.type;
    }
    public set type(value: string) {
        this._model.type = value;
    }

    public get order(): number {
        return this._model.order;
    }
    public set order(value: number) {
        this._model.order = value;
    }

    constructor(node: Node) {
        super(node);
        this._model = this.createModel()
    }

    protected createModel() {
        const model = new Model();
        model.transform = this.node;
        return model;
    }
}