import { BufferUsageFlagBits } from "../../core/gfx/Buffer.js";
import { IndexType, VertexInputAttributeDescription, VertexInputBindingDescription, VertexInputRate, VertexInputState } from "../../core/gfx/InputAssembler.js";
import { CullMode, FormatInfos, PassState, PrimitiveTopology } from "../../core/gfx/Pipeline.js";
import { Filter } from "../../core/gfx/Sampler.js";
import Shader from "../../core/gfx/Shader.js";
import Texture from "../../core/gfx/Texture.js";
import aabb2d, { AABB2D } from "../../core/math/aabb2d.js";
import BufferView from "../../core/render/buffers/BufferView.js";
import Model from "../../core/render/Model.js";
import Pass from "../../core/render/Pass.js";
import samplers from "../../core/render/samplers.js";
import SubModel from "../../core/render/SubModel.js";
import ShaderLib from "../../core/ShaderLib.js";
import BoundedRenderer, { BoundsEvent } from "../internal/BoundedRenderer.js";

ShaderLib.preloadedShaders.push({ name: 'zero', macros: { USE_ALBEDO_MAP: 1 } });

export default class SpriteRenderer extends BoundedRenderer {
    private _bounds = aabb2d.create();
    public get bounds(): Readonly<AABB2D> {
        return this._bounds;
    }

    private _texture!: Texture;
    public get texture(): Texture {
        return this._texture;
    }
    public set texture(value: Texture) {
        const { width, height } = value.info;
        const w = width / BoundedRenderer.PIXELS_PER_UNIT;
        const h = height / BoundedRenderer.PIXELS_PER_UNIT;
        aabb2d.set(this._bounds, 0, 0, w / 2, h / 2);
        this.emit(BoundsEvent.BOUNDS_CHANGED);

        this._texture = value;
    }

    private _model!: Model;

    override start(): void {
        const shader: Shader = ShaderLib.instance.getShader('zero', { USE_ALBEDO_MAP: 1 });

        const attributes: VertexInputAttributeDescription[] = [];
        const bindings: VertexInputBindingDescription[] = [];

        let definition = shader.info.meta.attributes["a_texCoord"];
        let attribute: VertexInputAttributeDescription = {
            location: definition.location,
            format: definition.format,
            binding: 0,
            offset: 0
        };
        attributes.push(attribute);
        bindings.push({
            binding: attribute.binding,
            stride: FormatInfos[attribute.format].size,
            inputRate: VertexInputRate.VERTEX
        })

        definition = shader.info.meta.attributes["a_position"];
        attribute = {
            location: definition.location,
            format: definition.format,
            binding: 1,
            offset: 0
        };
        attributes.push(attribute);
        bindings.push({
            binding: attribute.binding,
            stride: FormatInfos[attribute.format].size,
            inputRate: VertexInputRate.VERTEX
        });

        const texCoordBuffer = new BufferView("Float32", BufferUsageFlagBits.VERTEX, 8);
        const positionBuffer = new BufferView("Float32", BufferUsageFlagBits.VERTEX, 12);

        const uv_l = 0;
        const uv_r = 1;
        const uv_t = 0;
        const uv_b = 1;

        const { halfExtentX, halfExtentY } = this.bounds;
        const pos_l = -halfExtentX;
        const pos_r = halfExtentX;
        const pos_t = halfExtentY;
        const pos_b = -halfExtentY;

        texCoordBuffer.data[0] = uv_l;
        texCoordBuffer.data[1] = uv_t;
        positionBuffer.data[0] = pos_l;
        positionBuffer.data[1] = pos_t;
        positionBuffer.data[2] = 0;

        texCoordBuffer.data[2] = uv_l;
        texCoordBuffer.data[3] = uv_b;
        positionBuffer.data[3] = pos_l;
        positionBuffer.data[4] = pos_b;
        positionBuffer.data[5] = 0;

        texCoordBuffer.data[4] = uv_r;
        texCoordBuffer.data[5] = uv_b;
        positionBuffer.data[6] = pos_r;
        positionBuffer.data[7] = pos_b;
        positionBuffer.data[8] = 0;

        texCoordBuffer.data[6] = uv_r;
        texCoordBuffer.data[7] = uv_t;
        positionBuffer.data[9] = pos_r;
        positionBuffer.data[10] = pos_t;
        positionBuffer.data[11] = 0;

        const indexBuffer = new BufferView("Uint16", BufferUsageFlagBits.INDEX, 6);
        // By default, triangles defined with counter-clockwise vertices are processed as front-facing triangles
        indexBuffer.set([0, 1, 3, 3, 1, 2]);

        texCoordBuffer.update();
        positionBuffer.update();
        indexBuffer.update();

        const inputAssembler = gfx.createInputAssembler();
        inputAssembler.initialize({
            vertexInputState: new VertexInputState(attributes, bindings),
            vertexInput: {
                vertexBuffers: [texCoordBuffer.buffer, positionBuffer.buffer],
                vertexOffsets: [0, 0],
            },
            indexInput: {
                indexBuffer: indexBuffer.buffer,
                indexOffset: 0,
                indexType: IndexType.UINT16,
            }
        })

        const descriptorSet = gfx.createDescriptorSet();
        descriptorSet.initialize(ShaderLib.instance.getDescriptorSetLayout(shader));
        descriptorSet.bindTexture(0, this.texture, samplers.get({ magFilter: Filter.NEAREST, minFilter: Filter.NEAREST }));
        const subModel: SubModel = {
            inputAssemblers: [inputAssembler],
            passes: [new Pass(new PassState(shader, PrimitiveTopology.TRIANGLE_LIST, { cullMode: CullMode.NONE }), descriptorSet)], vertexOrIndexCount: indexBuffer.length
        };
        const model = new Model([subModel]);
        zero.scene.models.push(model);
        this._model = model;
    }

    commit(): void {
        if (this.node.hasChanged) {
            this._model.updateBuffer(this.node.world_matrix);
        }
        this._model.visibilityFlag = this.node.visibilityFlag;
    }
}