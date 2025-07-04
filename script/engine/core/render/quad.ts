import { device } from "boot";
import { Buffer, BufferInfo, BufferUsageFlagBits, Format, FormatInfos, IndexInput, IndexType, InputAssembler, PrimitiveTopology, VertexAttribute, VertexAttributeVector } from "gfx";
import { shaderLib } from "../shaderLib.js";
import { BufferView } from "./gfx/BufferView.js";

const indexBufferView = new BufferView('u16', BufferUsageFlagBits.INDEX);

let _quads = 0;

function indexGrowTo(quads: number) {
    if (_quads >= quads) {
        return;
    }

    let offset = indexBufferView.addBlock(6 * (quads - _quads));
    const source = indexBufferView.source;
    for (; _quads < quads; _quads++) {
        // By default, triangles defined with counter-clockwise vertices are processed as front-facing triangles
        source[offset + 0] = 4 * _quads + 0;
        source[offset + 1] = 4 * _quads + 1;
        source[offset + 2] = 4 * _quads + 2;
        source[offset + 3] = 4 * _quads + 2;
        source[offset + 4] = 4 * _quads + 3;
        source[offset + 5] = 4 * _quads + 0;
        offset += 6;
    }
}
indexGrowTo(1);

const indexInput = (function () {
    const indexInput = new IndexInput;
    indexInput.buffer = indexBufferView.buffer;
    indexInput.type = IndexType.UINT16;

    return indexInput;
})()

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

function createVertexBuffer(width: number, height: number, upsideDown = false) {
    const [v_top, v_bottom] = upsideDown ? [1, 0] : [0, 1]
    const vertexes = new Float32Array([
        -width / 2, height / 2, 0, v_top,    // top left 
        -width / 2, -height / 2, 0, v_bottom,   // bottom left
        width / 2, -height / 2, 1, v_bottom,   // bottom right
        width / 2, height / 2, 1, v_top   // top right
    ]);

    const bufferInfo = new BufferInfo;
    bufferInfo.size = vertexes.byteLength;
    bufferInfo.usage = BufferUsageFlagBits.VERTEX;
    const buffer = device.createBuffer(bufferInfo);
    buffer.upload(vertexes, 0, 0, 0);

    return buffer;
}

function createVertexBufferView() {
    return new BufferView('f32', BufferUsageFlagBits.VERTEX);
}

function createInputAssembler(vertexBuffer: Buffer) {
    const ia = new InputAssembler;
    ia.vertexInputState.attributes = vertexAttributes;
    ia.vertexInputState.primitive = PrimitiveTopology.TRIANGLE_LIST;
    ia.vertexInput.buffers.add(vertexBuffer);
    ia.vertexInput.offsets.add(0);
    ia.indexInput = indexInput;

    return ia;
}

export const quad = {
    indexBufferView,
    indexInput,
    indexGrowTo,
    createVertexBuffer,
    createVertexBufferView,
    createInputAssembler
} as const