import { FrameChangeRecord } from "./FrameChangeRecord.js";
import { Transform } from "./Transform.js";

export class DirectionalLight extends FrameChangeRecord {
    constructor(public transform: Transform) {
        super();
    }
}