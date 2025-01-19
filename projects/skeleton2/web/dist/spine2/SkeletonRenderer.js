import { BoundedRenderer, bundle, device, scene, Shader, shaderLib, vec4 } from "engine";
import { BlendFactor, BlendState, BufferInfo, BufferUsageFlagBits, Format, FormatInfos, IndexInput, IndexType, InputAssembler, PrimitiveTopology, VertexAttribute, VertexAttributeVector } from "gfx";
import { textureMap } from "./context.js";
import { wasm } from "./wasm.js";
const [VERTEX_ATTRIBUTES, VERTEX_ELEMENTS] = (function () {
    const attributes = new VertexAttributeVector;
    let elements = 0;
    const position = new VertexAttribute;
    position.format = Format.RG32_SFLOAT;
    position.location = shaderLib.attributes.position.location;
    attributes.add(position);
    elements += FormatInfos[position.format].elements;
    const texCoord = new VertexAttribute;
    texCoord.format = Format.RG32_SFLOAT;
    texCoord.offset = FormatInfos[position.format].bytes;
    texCoord.location = shaderLib.attributes.uv.location;
    attributes.add(texCoord);
    elements += FormatInfos[texCoord.format].elements;
    return [attributes, elements];
})();
const material_cache = await (async function () {
    const shader = await bundle.cache('./shaders/unlit', Shader);
    function create(blend, texture) {
        let blendState = undefined;
        switch (blend) {
            case 0:
                blendState = new BlendState;
                // blendState.srcRGB = BlendFactor.SRC_ALPHA;
                blendState.srcRGB = BlendFactor.ONE; // premultipliedAlpha
                blendState.dstRGB = BlendFactor.ONE_MINUS_SRC_ALPHA;
                blendState.srcAlpha = BlendFactor.ONE;
                blendState.dstAlpha = BlendFactor.ONE_MINUS_SRC_ALPHA;
                break;
            default:
                break;
        }
        const pass = new scene.Pass({ shader: shaderLib.getShader(shader, { USE_ALBEDO_MAP: 1 }), blendState });
        pass.setPropertyByName('albedo', vec4.ONE);
        pass.setTexture('albedoMap', textureMap.retrive(texture));
        return { passes: [pass] };
    }
    const cache = {};
    return function (blend, texture) {
        const k = `${blend}:${texture}`;
        let m = cache[k];
        if (!m) {
            cache[k] = m = create(blend, texture);
        }
        return m;
    };
})();
export class SkeletonRenderer extends BoundedRenderer {
    get bounds() {
        return this._mesh.bounds;
    }
    get data() {
        return this._data;
    }
    set data(value) {
        if (this._pointer) {
            wasm.exports.spiSkeleton_dispose(this._pointer);
        }
        const skeletonPtr = wasm.exports.spiSkeleton_create(value.pointer);
        // wasm.exports.spiSkeleton_updateWorldTransform(skeletonPtr);
        this._pointer = skeletonPtr;
        this._data = value;
    }
    constructor(node) {
        super(node);
        this._subMeshes = [];
        this._mesh = new scene.Mesh(this._subMeshes);
        this._materials = [];
        this._pointer = 0;
        this._data = null;
        this._spiModel = wasm.exports.spiModel_create();
        const vertexInfo = new BufferInfo;
        vertexInfo.usage = BufferUsageFlagBits.VERTEX;
        const vertexBuffer = device.createBuffer(vertexInfo);
        const indexInfo = new BufferInfo;
        indexInfo.usage = BufferUsageFlagBits.INDEX;
        const indexBuffer = device.createBuffer(indexInfo);
        const ia = new InputAssembler;
        ia.vertexInputState.attributes = VERTEX_ATTRIBUTES;
        ia.vertexInputState.primitive = PrimitiveTopology.TRIANGLE_LIST;
        ia.vertexInput.buffers.add(vertexBuffer);
        ia.vertexInput.offsets.add(0);
        const indexInput = new IndexInput;
        indexInput.buffer = indexBuffer;
        indexInput.type = IndexType.UINT16;
        ia.indexInput = indexInput;
        this._inputAssembler = ia;
        this._vertexBuffer = vertexBuffer;
        this._indexBuffer = indexBuffer;
    }
    createModel() {
        return new scene.Model(this.node, this._mesh, this._materials);
    }
    upload(commandBuffer) {
        wasm.exports.spiModel_update(this._spiModel, this._pointer);
        const verticesSize = wasm.exports.spiModel_getVerticesSize(this._spiModel);
        const verticesPtr = wasm.exports.spiModel_getVertices(this._spiModel);
        const vertices = wasm.HEAPF32.subarray(verticesPtr >> 2, (verticesPtr >> 2) + verticesSize);
        this._vertexBuffer.resize(vertices.byteLength);
        this._vertexBuffer.update(vertices, 0, vertices.length, 0);
        const indicesSize = wasm.exports.spiModel_getIndicesSize(this._spiModel);
        const indicesPtr = wasm.exports.spiModel_getIndices(this._spiModel);
        const indices = wasm.HEAPU16.subarray(indicesPtr >> 1, (indicesPtr >> 1) + indicesSize);
        this._indexBuffer.resize(indices.byteLength);
        this._indexBuffer.update(indices, 0, indices.length, 0);
        this._materials.length = 0;
        const subModelsSize = wasm.exports.spiModel_getSubModelsSize(this._spiModel);
        const subModels = wasm.exports.spiModel_getSubModels(this._spiModel);
        let first = 0;
        for (let i = 0; i < subModelsSize; i++) {
            const subModel = wasm.HEAPU32[(subModels + 4 * i) >> 2];
            const range = wasm.exports.spiSubModel_getRange(subModel);
            const texture = wasm.exports.spiSubModel_getRendererObject(subModel);
            this._materials.push(material_cache(0, texture));
            if (this._subMeshes.length == i) {
                this._subMeshes.push(new scene.SubMesh(this._inputAssembler));
            }
            const draw = this._subMeshes[i].draw;
            draw.first = first;
            draw.count = range;
            first += range;
        }
        this._subMeshes.length = subModelsSize;
    }
}
SkeletonRenderer.PIXELS_PER_UNIT = 1;
