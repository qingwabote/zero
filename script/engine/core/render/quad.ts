import { device } from "boot";
import { Buffer, BufferInfo, BufferUsageFlagBits, Format, FormatInfos, IndexInput, IndexType, InputAssemblerInfo, MemoryUsage, VertexAttribute, VertexAttributeVector, VertexInput } from "gfx";
import { BufferView } from "./BufferView.js";

const indexBufferView = new BufferView("Uint16", BufferUsageFlagBits.INDEX);

let _quads = 0;

function indexGrowTo(quads: number) {
    if (_quads >= quads) {
        return;
    }

    indexBufferView.resize(6 * quads);
    for (; _quads < quads; _quads++) {
        // By default, triangles defined with counter-clockwise vertices are processed as front-facing triangles
        indexBufferView.source[6 * _quads + 0] = 4 * _quads + 0;
        indexBufferView.source[6 * _quads + 1] = 4 * _quads + 1;
        indexBufferView.source[6 * _quads + 2] = 4 * _quads + 2;
        indexBufferView.source[6 * _quads + 3] = 4 * _quads + 2;
        indexBufferView.source[6 * _quads + 4] = 4 * _quads + 3;
        indexBufferView.source[6 * _quads + 5] = 4 * _quads + 0;
    }
    indexBufferView.invalidate();
    indexBufferView.update();
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

    const a_position = new VertexAttribute;
    a_position.name = 'a_position';
    a_position.format = Format.RG32_SFLOAT;
    a_position.offset = 0;
    attributes.add(a_position);

    const a_texCoord = new VertexAttribute;
    a_texCoord.name = 'a_texCoord';
    a_texCoord.format = Format.RG32_SFLOAT;
    a_texCoord.offset = FormatInfos[a_position.format].bytes;
    attributes.add(a_texCoord);

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
    bufferInfo.mem_usage = MemoryUsage.CPU_TO_GPU;
    const buffer = device.createBuffer(bufferInfo);
    buffer.update(vertexes.buffer, 0, vertexes.byteLength);

    return buffer;
}

function createVertexBufferView() {
    return new BufferView("Float32", BufferUsageFlagBits.VERTEX);
}

function createInputAssembler(vertexBuffer: Buffer) {
    const vertexInput = new VertexInput;
    vertexInput.buffers.add(vertexBuffer);
    vertexInput.offsets.add(0);

    const iaInfo = new InputAssemblerInfo
    iaInfo.vertexAttributes = vertexAttributes;
    iaInfo.vertexInput = vertexInput;
    iaInfo.indexInput = indexInput;

    return device.createInputAssembler(iaInfo);
}

export const quad = {
    indexInput,
    indexGrowTo,
    createVertexBuffer,
    createVertexBufferView,
    createInputAssembler
} as const