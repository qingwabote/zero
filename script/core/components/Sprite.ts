import Component from "../Component.js";
import { BufferUsageFlagBits } from "../gfx/Buffer.js";
import { FormatInfos, IndexType, InputAssembler, VertexInputAttributeDescription, VertexInputBindingDescription, VertexInputRate } from "../gfx/Pipeline.js";
import Shader from "../gfx/Shader.js";
import Texture from "../gfx/Texture.js";
import BufferView from "../render/BufferView.js";
import Model from "../render/Model.js";
import Pass from "../render/Pass.js";
import SubModel from "../render/SubModel.js";

const inputAssemblerCache: Record<string, InputAssembler> = {};

export default class Sprite extends Component {
    width: number = 200;
    height: number = 200;

    texture!: Texture;

    private _shader!: Shader;
    get shader(): Shader {
        return this._shader;
    }
    set shader(value: Shader) {
        this._shader = value;
    }

    override start(): void {
        let inputAssembler = inputAssemblerCache[this._shader.info.hash];
        if (!inputAssembler) {
            const attributes: VertexInputAttributeDescription[] = [];
            const bindings: VertexInputBindingDescription[] = [];

            let definition = this._shader.info.meta.attributes["a_texCoord"];
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

            definition = this._shader.info.meta.attributes["a_position"];
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
            const positionBuffer = new BufferView("Float32", BufferUsageFlagBits.VERTEX, 16);

            const l = 0;
            const r = 1;
            const t = 0;
            const b = 1;

            texCoordBuffer.data[0] = l;
            texCoordBuffer.data[1] = t;
            positionBuffer.data[0] = 0;
            positionBuffer.data[1] = 0;
            positionBuffer.data[2] = 0;
            positionBuffer.data[3] = 1;

            texCoordBuffer.data[2] = r;
            texCoordBuffer.data[3] = t;
            positionBuffer.data[4] = this.width;
            positionBuffer.data[5] = 0;
            positionBuffer.data[6] = 0;
            positionBuffer.data[7] = 1;

            texCoordBuffer.data[4] = r;
            texCoordBuffer.data[5] = b;
            positionBuffer.data[8] = this.width;
            positionBuffer.data[9] = - this.height;
            positionBuffer.data[10] = 0;
            positionBuffer.data[11] = 1;

            texCoordBuffer.data[6] = l;
            texCoordBuffer.data[7] = b;
            positionBuffer.data[12] = 0;
            positionBuffer.data[13] = -this.height;
            positionBuffer.data[14] = 0;
            positionBuffer.data[15] = 1;

            const indexBuffer = new BufferView("Uint16", BufferUsageFlagBits.INDEX, 6);
            indexBuffer.set([0, 1, 2, 2, 3, 0]);

            texCoordBuffer.update();
            positionBuffer.update();
            indexBuffer.update();

            inputAssembler = {
                vertexInputState: { attributes, bindings, hash: "Sprite" },
                vertexInput: {
                    vertexBuffers: [texCoordBuffer.buffer, positionBuffer.buffer],
                    vertexOffsets: [0, 0],
                    indexBuffer: indexBuffer.buffer,
                    indexType: IndexType.UINT16,
                    indexCount: indexBuffer.length,
                    indexOffset: 0
                }
            }
        }
        const pass = new Pass(this._shader);
        pass.descriptorSet.bindTexture(0, this.texture);

        const subModel: SubModel = { inputAssemblers: [inputAssembler], passes: [pass] };
        const model = new Model([subModel], this._node);
        zero.renderScene.models.push(model);
    }
}