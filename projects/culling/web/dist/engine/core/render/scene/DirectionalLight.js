import { Zero } from "../../Zero.js";
import { mat4 } from "../../math/mat4.js";
import { vec3 } from "../../math/vec3.js";
import { ChangeRecord } from "./ChangeRecord.js";
export class DirectionalLight extends ChangeRecord {
    get hasChanged() {
        return this.transform.hasChanged;
    }
    get model() {
        if (this._model_invalidated) {
            mat4.fromTRS(this._model, vec3.ZERO, this.transform.world_rotation, vec3.ONE);
            this._model_invalidated = false;
        }
        return this._model;
    }
    get view() {
        if (this._view_invalidated) {
            mat4.invert(this._view, this.model);
            this._view_invalidated = false;
        }
        return this._view;
    }
    constructor(transform) {
        super();
        this.transform = transform;
        this._model_invalidated = false;
        this._model = mat4.create();
        this._view_invalidated = false;
        this._view = mat4.create();
        Zero.instance.scene.directionalLight = this;
    }
    update() {
        if (!this.hasChanged) {
            return;
        }
        this._model_invalidated = true;
        this._view_invalidated = true;
    }
}
