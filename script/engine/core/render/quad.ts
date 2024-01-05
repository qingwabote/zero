import { device } from "boot";
import { BufferInfo, BufferUsageFlagBits, Format, FormatInfos, IndexInput, IndexType, InputAssemblerInfo, MemoryUsage, VertexAttribute, VertexAttributeVector, VertexInput } from "gfx";

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

/**top right -> bottom right -> bottom left -> top left  */
const indexInput = (function () {
    // By default, triangles defined with counter-clockwise vertices are processed as front-facing triangles
    const indexes = new Uint16Array([0, 3, 2, 0, 2, 1])
    const bufferInfo = new BufferInfo;
    bufferInfo.size = indexes.byteLength;
    bufferInfo.usage = BufferUsageFlagBits.INDEX;
    bufferInfo.mem_usage = MemoryUsage.CPU_TO_GPU;
    const buffer = device.createBuffer(bufferInfo);
    buffer.update(indexes.buffer, 0, indexes.byteLength);

    const indexInput = new IndexInput;
    indexInput.buffer = buffer;
    indexInput.type = IndexType.UINT16;

    return indexInput;
})()

export function createInputAssembler(width: number, height: number, upsideDown = false) {
    const [v_top, v_bottom] = upsideDown ? [1, 0] : [0, 1]
    const vertexes = new Float32Array([
        width / 2, height / 2, 1, v_top,   // top right
        width / 2, -height / 2, 1, v_bottom,   // bottom right
        -width / 2, -height / 2, 0, v_bottom,   // bottom left
        -width / 2, height / 2, 0, v_top    // top left 
    ]);

    const vertexBufferInfo = new BufferInfo;
    vertexBufferInfo.size = vertexes.byteLength;
    vertexBufferInfo.usage = BufferUsageFlagBits.VERTEX;
    vertexBufferInfo.mem_usage = MemoryUsage.CPU_TO_GPU;
    const vertexBuffer = device.createBuffer(vertexBufferInfo);
    vertexBuffer.update(vertexes.buffer, 0, vertexes.byteLength);

    const vertexInput = new VertexInput;
    vertexInput.buffers.add(vertexBuffer);
    vertexInput.offsets.add(0);

    const iaInfo = new InputAssemblerInfo
    iaInfo.vertexAttributes = vertexAttributes;
    iaInfo.vertexInput = vertexInput;
    iaInfo.indexInput = indexInput;

    return device.createInputAssembler(iaInfo);
}