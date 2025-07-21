import { device } from "boot";
import { Buffer, BufferInfo, BufferUsageFlagBits, CommandBuffer, Format, FormatInfos, IndexInput, IndexType, InputAssembler, PrimitiveTopology, VertexAttribute, VertexAttributeVector } from "gfx";
import { shaderLib } from "../shaderLib.js";
import { BufferView } from "./gfx/BufferView.js";

const vertexAttributes = (function () {
    const attributes = new VertexAttributeVector;

    const position = new VertexAttribute;
    position.format = Format.RG32_SFLOAT;
    position.offset = 0;
    position.location = shaderLib.attributes.position.location;
    attributes.add(position);

    const texCoord = new VertexAttribute;
    texCoord.format = Format.RG32_SFLOAT;
    texCoord.offset = FormatInfos[position.format].bytes;
    texCoord.location = shaderLib.attributes.texcoord.location;
    attributes.add(texCoord);

    return attributes;
})();

export class Quadrat {
    private _count = 0;

    private readonly _indices = new BufferView('u16', BufferUsageFlagBits.INDEX);

    private readonly indexInput: IndexInput

    constructor() {
        const indexInput = new IndexInput;
        indexInput.buffer = this._indices.buffer;
        indexInput.type = IndexType.UINT16;
        this.indexInput = indexInput;

        this.reserve(1);
    }

    update(cmd: CommandBuffer) {
        this._indices.update(cmd);
    }

    reserve(count: number) {
        if (this._count >= count) {
            return;
        }

        let offset = this._indices.addBlock(6 * (count - this._count));
        const source = this._indices.source;
        for (; this._count < count; this._count++) {
            // By default, triangles defined with counter-clockwise vertices are processed as front-facing triangles
            source[offset + 0] = 4 * this._count + 0;
            source[offset + 1] = 4 * this._count + 1;
            source[offset + 2] = 4 * this._count + 2;
            source[offset + 3] = 4 * this._count + 2;
            source[offset + 4] = 4 * this._count + 3;
            source[offset + 5] = 4 * this._count + 0;
            offset += 6;
        }
    }

    createVertexBuffer(width: number, height: number, upsideDown = false) {
        const [v_top, v_bottom] = upsideDown ? [1, 0] : [0, 1]
        const vertices = new Float32Array([
            -width / 2, height / 2, 0, v_top,    // top left 
            -width / 2, -height / 2, 0, v_bottom,   // bottom left
            width / 2, -height / 2, 1, v_bottom,   // bottom right
            width / 2, height / 2, 1, v_top   // top right
        ]);

        const bufferInfo = new BufferInfo;
        bufferInfo.size = vertices.byteLength;
        bufferInfo.usage = BufferUsageFlagBits.VERTEX;
        const buffer = device.createBuffer(bufferInfo);
        buffer.upload(vertices, 0, 0, 0);
        return buffer;
    }

    createVertexBufferView() {
        return new BufferView('f32', BufferUsageFlagBits.VERTEX);
    }

    createInputAssembler(vertices: Buffer) {
        const ia = new InputAssembler;
        ia.vertexInputState.attributes = vertexAttributes;
        ia.vertexInputState.primitive = PrimitiveTopology.TRIANGLE_LIST;
        ia.vertexInput.buffers.add(vertices);
        ia.vertexInput.offsets.add(0);
        ia.indexInput = this.indexInput;
        return ia;
    }
}

export const quadrat = new Quadrat;