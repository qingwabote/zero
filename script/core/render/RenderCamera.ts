import Buffer, { BufferUsageBit } from "../gfx/Buffer.js";
import mat4 from "../math/mat4.js";
import { Rect } from "../math/rect.js";
import render, { TransformSource } from "../render.js";
import RenderWindow from "./RenderWindow.js";

export default class RenderCamera {
    private _dirty = true;

    private _orthoHeight = -1;
    get orthoHeight(): number {
        return this._orthoHeight;
    }
    set orthoHeight(value: number) {
        this._orthoHeight = value;
        this._dirty = true;
    }

    private _fov = -1;
    get fov(): number {
        return this._fov;
    }
    set fov(value: number) {
        this._fov = value;
        this._dirty = true;
    }

    private _viewport: Rect = { x: 0, y: 0, width: 1, height: 1 };
    get viewport(): Readonly<Rect> {
        return this._viewport
    }
    set viewport(value: Readonly<Rect>) {
        this._viewport = value;
        this._dirty = true;
    }

    private _matView = mat4.create();
    private _matProj = mat4.create();

    private _uboSrc: Float32Array;

    private _ubo: Buffer;
    get ubo(): Buffer {
        return this._ubo;
    }

    private _window: RenderWindow;

    private _transform: TransformSource;

    constructor(window: RenderWindow, transform: TransformSource) {
        render.dirtyTransforms.set(transform, transform);

        this._uboSrc = new Float32Array(this._matView.length + this._matProj.length);
        this._ubo = zero.device.createBuffer({ usage: BufferUsageBit.UNIFORM, size: this._uboSrc.byteLength });

        this._window = window;
        this._transform = transform;
    }

    update() {
        let uboDirty = false;

        let offset = 0;
        if (render.dirtyTransforms.has(this._transform)) {
            this._transform.updateMatrix();
            const matView = mat4.create();
            mat4.invert(matView, this._transform.matrix);
            this._uboSrc.set(matView, offset);

            uboDirty = true;
        }
        offset += 16;

        if (this._dirty) {
            const aspect = (this._window.width * this._viewport.width) / (this._window.height * this._viewport.height);
            if (this.orthoHeight != -1) {
                const x = this.orthoHeight * aspect;
                const y = this.orthoHeight;
                mat4.ortho(this._matProj, -x, x, -y, y, 1, 2000);
            } else if (this.fov != -1) {
                mat4.perspective(this._matProj, Math.PI / 180 * this.fov, aspect, 1, 1000);
            }
            this._uboSrc.set(this._matProj, offset);

            uboDirty = true;
            this._dirty = false;
        }

        if (uboDirty) {
            this._ubo.update(this._uboSrc);
        }
    }
}