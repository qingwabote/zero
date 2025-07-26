import { InputAssembler } from "gfx";

interface Range {
    count: number;
    first: number;
}

export class Draw {
    constructor(
        readonly inputAssembler: InputAssembler,
        readonly range: Range = { count: 0, first: 0 }
    ) { }
}

export declare namespace Draw {
    export { Range }
}