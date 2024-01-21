import { Component } from "../../core/Component.js";
import { Model } from "../../core/render/scene/Model.js";
export class ModelRenderer extends Component {
    get type() {
        return this._model.type;
    }
    set type(value) {
        this._model.type = value;
    }
    get order() {
        return this._model.order;
    }
    set order(value) {
        this._model.order = value;
    }
    constructor(node) {
        super(node);
        this._model = this.createModel();
    }
    createModel() {
        const model = new Model();
        model.transform = this.node;
        return model;
    }
}
