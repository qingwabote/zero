import { InputAssembler } from "gfx";

interface Draw {
    count: number;
    first: number;
}

export class SubMesh {
    constructor(
        readonly inputAssembler: InputAssembler,
        readonly draw: Draw = { count: 0, first: 0 }
    ) { }
}

export declare namespace SubMesh {
    export { Draw }
}