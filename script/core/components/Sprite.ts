import Component from "../Component.js";
import { BufferUsageFlagBits } from "../gfx/Buffer.js";
import { IndexType, VertexInputAttributeDescription, VertexInputBindingDescription, VertexInputRate, VertexInputState } from "../gfx/InputAssembler.js";
import { FormatInfos } from "../gfx/Pipeline.js";
import { Filter } from "../gfx/Sampler.js";
import Shader from "../gfx/Shader.js";
import Texture from "../gfx/Texture.js";
import BufferView from "../render/buffers/BufferView.js";
import Model from "../render/Model.js";
import Pass from "../render/Pass.js";
import samplers from "../render/samplers.js";
import SubModel from "../render/SubModel.js";
import ShaderLib from "../ShaderLib.js";

ShaderLib.preloadedShaders.push({ name: 'depth' });

export default class Sprite extends Component {
    width: number = 200;
    height: number = 200;

    texture!: Texture;

    override start(): void {
        const shader: Shader = ShaderLib.instance.getShader('depth');

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

        const l = 0;
        const r = 1;
        const t = 0;
        const b = 1;

        texCoordBuffer.data[0] = l;
        texCoordBuffer.data[1] = t;
        positionBuffer.data[0] = 0;
        positionBuffer.data[1] = 0;
        positionBuffer.data[2] = 0;

        texCoordBuffer.data[2] = r;
        texCoordBuffer.data[3] = t;
        positionBuffer.data[3] = this.width;
        positionBuffer.data[4] = 0;
        positionBuffer.data[5] = 0;

        texCoordBuffer.data[4] = r;
        texCoordBuffer.data[5] = b;
        positionBuffer.data[6] = this.width;
        positionBuffer.data[7] = - this.height;
        positionBuffer.data[8] = 0;

        texCoordBuffer.data[6] = l;
        texCoordBuffer.data[7] = b;
        positionBuffer.data[9] = 0;
        positionBuffer.data[10] = -this.height;
        positionBuffer.data[11] = 0;

        const indexBuffer = new BufferView("Uint16", BufferUsageFlagBits.INDEX, 6);
        // By default, triangles defined with counter-clockwise vertices are processed as front-facing triangles
        indexBuffer.set([0, 2, 1, 2, 0, 3]);

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
        const subModel: SubModel = { inputAssemblers: [inputAssembler], passes: [new Pass(shader, descriptorSet)], vertexOrIndexCount: indexBuffer.length };
        const model = new Model([subModel], this._node);
        zero.renderScene.models.push(model);
    }
}