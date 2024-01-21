export class SubMesh {
    constructor(inputAssembler, vertexPositionMin, vertexPositionMax, drawInfo = { count: 0, first: 0 }) {
        this.inputAssembler = inputAssembler;
        this.vertexPositionMin = vertexPositionMin;
        this.vertexPositionMax = vertexPositionMax;
        this.drawInfo = drawInfo;
    }
}
