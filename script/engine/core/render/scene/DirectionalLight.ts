import { Zero } from "../../Zero.js";
import { Mat4, mat4 } from "../../math/mat4.js";
import { vec3 } from "../../math/vec3.js";
import { Transform } from "./Transform.js";

export class DirectionalLight {
    get hasChanged(): number {
        return this.transform.hasChanged.value;
    }

    private _model_invalidated = false;
    private _model = mat4.create();
    public get model(): Readonly<Mat4> {
        if (this._model_invalidated) {
            mat4.fromTRS(this._model, vec3.ZERO, this.transform.world_rotation, vec3.ONE);
            this._model_invalidated = false;
        }
        return this._model;
    }

    private _view_invalidated = false;
    private _view = mat4.create();
    public get view(): Readonly<Mat4> {
        if (this._view_invalidated) {
            mat4.invert(this._view, this.model);
            this._view_invalidated = false;
        }
        return this._view;
    }

    constructor(public transform: Transform) {
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