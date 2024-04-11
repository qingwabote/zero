import { Component } from "../../core/Component.js";
import { Zero } from "../../core/Zero.js";
export class ModelRenderer extends Component {
    constructor() {
        super(...arguments);
        this._model = null;
        this._type = 'default';
        this._order = 0;
    }
    get type() {
        return this._type;
    }
    set type(value) {
        this._type = value;
    }
    get order() {
        return this._order;
    }
    set order(value) {
        this._order = value;
    }
    update(dt) {
        if (!this._model) {
            (this._model = this.createModel()) && Zero.instance.scene.addModel(this._model);
        }
        if (this._model) {
            this._model.type = this._type;
            this._model.order = this._order;
        }
    }
}
