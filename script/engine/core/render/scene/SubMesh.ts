import { InputAssembler } from "gfx";
import { Vec3 } from "../../math/vec3.js";

export interface DrawInfo {
    count: number;
    first: number;
}

export class SubMesh {
    constructor(
        readonly inputAssembler: InputAssembler,

        readonly vertexPositionMin: Vec3,
        readonly vertexPositionMax: Vec3,

        readonly drawInfo: DrawInfo = { count: 0, first: 0 }
    ) {
    }
}