import { mat4 } from "gl-matrix";
import gfx from "../gfx.js";
import Buffer, { BufferUsageBit } from "../gfx/Buffer.js";

export default class Camera {
    orthoHeight = -1;
    fov = -1;

    private _matProj: Float32Array = mat4.create() as Float32Array;

    private _ubo: Buffer;
    get ubo(): Buffer {
        return this._ubo;
    }

    private _width: number;
    private _height: number;

    constructor(width: number, height: number) {
        this._width = width;
        this._height = height;

        this._ubo = gfx.device.createBuffer({ usage: BufferUsageBit.UNIFORM, size: this._matProj.byteLength });
    }

    update() {
        const aspect = this._width / this._height;
        if (this.orthoHeight != -1) {
            const x = this.orthoHeight * aspect;
            const y = this.orthoHeight;
            mat4.ortho(this._matProj, -x, x, -y, y, 1, 2000);
        } else if (this.fov != -1) {
            mat4.perspective(this._matProj, Math.PI / 180 * this.fov, aspect, 1, 1000);

        }

        this._ubo.update(this._matProj);
    }
}