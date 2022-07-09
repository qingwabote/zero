import { mat4 } from "gl-matrix";
import Buffer, { BufferUsageBit } from "./gfx/Buffer.js";
import game from "./game.js";
import gfx from "./gfx.js";

export default class Camera {
    private _orthoHeight;

    private _matProj: Float32Array = mat4.create() as Float32Array;

    private _ubo: Buffer;
    get ubo(): Buffer {
        return this._ubo;
    }

    constructor(orthoHeight: number) {
        this._orthoHeight = orthoHeight;

        this._ubo = gfx.device.createBuffer({ usage: BufferUsageBit.UNIFORM, size: this._matProj.byteLength, stride: 1 });
    }

    update() {
        const aspect = game.width / game.height
        const x = this._orthoHeight * aspect;
        const y = this._orthoHeight;
        mat4.ortho(this._matProj, -x, x, -y, y, -1, 2000);

        this._ubo.update(this._matProj);
    }
}