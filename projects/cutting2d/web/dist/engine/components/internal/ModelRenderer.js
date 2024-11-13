import { Component } from "../../core/Component.js";
import { Zero } from "../../core/Zero.js";
export class ModelRenderer extends Component {
    constructor() {
        super(...arguments);
        this._model = null;
    }
    update(dt) {
        if (!this._model) {
            (this._model = this.createModel()) && Zero.instance.scene.addModel(this._model);
        }
    }
}
