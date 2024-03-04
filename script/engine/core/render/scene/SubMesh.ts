import { InputAssembler } from "gfx";

export interface DrawInfo {
    count: number;
    first: number;
}

export class SubMesh {
    constructor(
        readonly inputAssembler: InputAssembler,
        readonly drawInfo: DrawInfo = { count: 0, first: 0 }
    ) { }
}