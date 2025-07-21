import { BoundedRenderer, bundle, device, Node, scene, Shader, shaderLib, vec4 } from "engine";
import { BlendFactor, BlendState, Buffer, BufferInfo, BufferUsageFlagBits, CommandBuffer, Format, FormatInfos, IndexInput, IndexType, InputAssembler, PrimitiveTopology, VertexAttribute, VertexAttributeVector } from "gfx";
import { pk } from "puttyknife";
import { textureMap } from "./context.js";
import { SkeletonData } from "./SkeletonData.js";

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
    texCoord.location = shaderLib.attributes.texcoord.location;
    attributes.add(texCoord);
    elements += FormatInfos[texCoord.format].elements;

    return [attributes, elements];
})()

const material_cache = await (async function () {
    const shader = await bundle.cache('./shaders/unlit', Shader);

    function create(blend: number, texture: number): scene.Material {
        let blendState: BlendState | undefined = undefined
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
        const pass = new scene.Pass({ shader: shaderLib.getShader(shader, { USE_ALBEDO_MAP: 1 }), blendState })
        pass.setPropertyByName('albedo', vec4.ONE);
        pass.setTexture('albedoMap', textureMap.retrive(texture));

        return { passes: [pass] };
    }

    const cache: Record<string, scene.Material> = {};

    return function (blend: number, texture: number) {
        const k = `${blend}:${texture}`;
        let m = cache[k];
        if (!m) {
            cache[k] = m = create(blend, texture);
        }
        return m;
    }
})()

export class SkeletonRenderer extends BoundedRenderer {
    static readonly PIXELS_PER_UNIT = 1;

    private _subMeshes: scene.SubMesh[] = [];

    private _mesh = new scene.Mesh(this._subMeshes);
    private _materials: scene.Material[] = [];

    public get bounds() {
        return this._mesh.bounds;
    }

    protected _pointer: number = 0;

    private _data: SkeletonData | null = null;
    public get data(): SkeletonData | null {
        return this._data;
    }
    public set data(value: SkeletonData) {
        if (this._pointer) {
            pk.fn.spiSkeleton_dispose(this._pointer);
        }
        const skeletonPtr = pk.fn.spiSkeleton_create(value.pointer);
        // spi.fn.spiSkeleton_updateWorldTransform(skeletonPtr);
        this._pointer = skeletonPtr;
        this._data = value;
    }

    private readonly _vertexBuffer: Buffer;
    private readonly _indexBuffer: Buffer;

    private readonly _inputAssembler: InputAssembler;

    private readonly _spiModel: number = pk.fn.spiModel_create();

    constructor(node: Node) {
        super(node);

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

    protected createModel(): scene.Model | null {
        return new scene.Model(this.node, this._mesh, this._materials);
    }

    override lateUpdate(): void {
        pk.fn.spiModel_update(this._spiModel, this._pointer);
        this._materials.length = 0;
        const subModelsSize = pk.fn.spiModel_getSubModelsSize(this._spiModel);
        const subModels = pk.fn.spiModel_getSubModels(this._spiModel);
        let first = 0;
        for (let i = 0; i < subModelsSize; i++) {
            const subModel = pk.heap.objAtArr(subModels, i)
            const range = pk.fn.spiSubModel_getRange(subModel);
            const texture = pk.fn.spiSubModel_getRendererObject(subModel);
            this._materials.push(material_cache(0, texture));
            if (this._subMeshes.length == i) {
                this._subMeshes.push(new scene.SubMesh(this._inputAssembler))
            }
            const draw = this._subMeshes[i].draw;
            draw.first = first;
            draw.count = range;

            first += range;
        }
        this._subMeshes.length = subModelsSize;
    }

    override upload(commandBuffer: CommandBuffer): void {
        const verticesSize = pk.fn.spiModel_getVerticesSize(this._spiModel);
        const verticesPtr = pk.fn.spiModel_getVertices(this._spiModel);
        const vertices = pk.heap.getBuffer(verticesPtr, 'f32', verticesSize);
        this._vertexBuffer.resize(vertices.byteLength);
        this._vertexBuffer.upload(vertices, 0, 0, 0);

        const indicesSize = pk.fn.spiModel_getIndicesSize(this._spiModel);
        const indicesPtr = pk.fn.spiModel_getIndices(this._spiModel);
        const indices = pk.heap.getBuffer(indicesPtr, 'u16', indicesSize)
        this._indexBuffer.resize(indices.byteLength);
        this._indexBuffer.upload(indices, 0, 0, 0);
    }
}