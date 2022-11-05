// https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html

import MeshRenderer from "../components/MeshRenderer.js";
import Buffer, { BufferUsageFlagBits, MemoryUsage } from "../gfx/Buffer.js";
import CommandBuffer from "../gfx/CommandBuffer.js";
import Fence from "../gfx/Fence.js";
import { Format, IndexType } from "../gfx/Pipeline.js";
import mat4 from "../math/mat4.js";
import { Quat } from "../math/quat.js";
import { Vec3 } from "../math/vec3.js";
import Node from "../Node.js";
import Material from "../render/Material.js";
import Mesh from "../render/Mesh.js";
import Pass from "../render/Pass.js";
import SubMesh, { Attribute } from "../render/SubMesh.js";
import shaders from "../shaders.js";
import Asset from "./Asset.js";
import Texture from "./Texture.js";

const builtinAttributes: Record<string, string> = {
    "POSITION": "a_position",
    "TEXCOORD_0": "a_texCoord",
    "NORMAL": "a_normal"
}

const formatPart1Names: Record<string, string> = {
    "SCALAR": "R",
    "VEC2": "RG",
    "VEC3": "RGB",
    "VEC4": "RGBA"
}

const formatPart2Names: Record<number, string> = {
    5123: "16UI",
    5125: "32UI",
    5126: "32F"
}

let _commandBuffer: CommandBuffer;
let _fence: Fence;

export default class GLTF extends Asset {
    private _json: any;
    private _bin: ArrayBuffer | undefined;

    private _buffers: Buffer[] = [];
    private _textures: Texture[] = [];
    private _materials: Material[] = [];

    private _commandBuffer: CommandBuffer;
    private _fence: Fence;

    constructor() {
        super();
        this._commandBuffer = gfx.createCommandBuffer();
        this._commandBuffer.initialize();
        this._fence = gfx.createFence();
        this._fence.initialize();
    }

    async load(url: string) {
        const res = url.match(/(.+)\/(.+)$/);
        if (!res) {
            return;
        }

        const [, parent, name] = res;
        const json = JSON.parse(await zero.loader.load(`${parent}/${name}.gltf`, "text", this.onProgress));
        this._bin = await zero.loader.load(`${parent}/${json.buffers[0].uri}`, "arraybuffer", this.onProgress);
        const textures = await Promise.all(json.images.map((info: any) => (new Texture).load(`${parent}/${info.uri}`)));
        this._materials = await Promise.all(json.materials.map(async (info: any) => {
            const textureIdx: number = info.pbrMetallicRoughness.baseColorTexture?.index;
            const shader = await shaders.getShader('phong', { USE_BLINN_PHONG: 1, USE_ALBEDO_MAP: textureIdx == undefined ? 0 : 1 })
            const pass = new Pass(shader);
            if (textureIdx != undefined) {
                pass.descriptorSet.bindTexture(0, textures[json.textures[textureIdx].source].gfx_texture);
            }
            return new Material([pass]);
        }));
        this._textures = textures;

        this._json = json;
    }

    createScene(name: string): Node | null {
        if (!this._json || !this._bin || !this._textures) return null;

        const scenes: any[] = this._json.scenes;
        const scene = scenes.find(scene => scene.name == name);
        return this.createNode(this._json.nodes[scene.nodes[0]]);
    }

    private createNode(info: any, parent?: Node): Node {
        const node = new Node(info.name);
        if (info.matrix) {
            mat4.toRTS(info.matrix, node.rotation as Quat, node.position as Vec3, node.scale as Vec3);
        } else {
            if (info.translation) {
                node.position = info.translation;
            }
            if (info.rotation) {
                node.rotation = info.rotation;
            }
            if (info.scale) {
                node.scale = info.scale;
            }
        }

        if (info.mesh != undefined) {
            this.createMesh(node, this._json.meshes[info.mesh]);
        }

        if (info.children) {
            for (const idx of info.children) {
                const info = this._json.nodes[idx];
                node.addChild(this.createNode(info, node));
            }
        }

        parent?.addChild(node);
        return node;
    }

    private createMesh(node: Node, info: any) {
        const subMeshes: SubMesh[] = [];
        const materials: Material[] = [];
        for (const primitive of info.primitives) {
            const vertexBuffers: Buffer[] = [];
            const vertexOffsets: number[] = [];
            const attributes: Attribute[] = [];
            for (const name in primitive.attributes) {
                const accessor = this._json.accessors[primitive.attributes[name]];
                const format: Format = (Format as any)[`${formatPart1Names[accessor.type]}${formatPart2Names[accessor.componentType]}`];
                // if (format == undefined) {
                //     console.error(`unknown format of accessor: type ${accessor.type} componentType ${accessor.componentType}`)
                // }
                const attribute: Attribute = {
                    name: builtinAttributes[name] || name,
                    format,
                    buffer: vertexBuffers.length,
                    offset: 0
                }
                attributes.push(attribute);
                vertexBuffers.push(this.getBuffer(accessor.bufferView, BufferUsageFlagBits.VERTEX));
                vertexOffsets.push(accessor.byteOffset || 0);
            }

            const accessor = this._json.accessors[primitive.indices];
            const buffer = this.getBuffer(accessor.bufferView, BufferUsageFlagBits.INDEX);

            if (primitive.material != undefined) {
                materials.push(this._materials[primitive.material]);
            }

            if (accessor.type != "SCALAR") {
                throw new Error("unsupported index type");
            }
            let indexType: IndexType;
            switch (accessor.componentType) {
                case 5123:
                    indexType = IndexType.UINT16;
                    break;
                case 5125:
                    indexType = IndexType.UINT32;
                    break;
                default:
                    throw new Error("unsupported index type");
            }
            subMeshes.push(new SubMesh(attributes, vertexBuffers, vertexOffsets, buffer, indexType, accessor.count, accessor.byteOffset || 0))
        }

        const renderer = node.addComponent(MeshRenderer);
        renderer.mesh = new Mesh(subMeshes);
        renderer.materials = materials;
    }

    private getBuffer(index: number, usage: BufferUsageFlagBits): Buffer {
        let buffer = this._buffers[index];
        if (!this._buffers[index]) {
            const viewInfo = this._json.bufferViews[index];
            // if (usage & BufferUsageBit.VERTEX) {
            //     console.assert(viewInfo.target == 34962)
            // } else {
            //     console.assert(viewInfo.target == 34963)
            // }
            const view = new DataView(this._bin!, viewInfo.byteOffset, viewInfo.byteLength)
            buffer = gfx.createBuffer();

            if (usage & BufferUsageFlagBits.VERTEX) {
                buffer.initialize({
                    usage: usage | BufferUsageFlagBits.TRANSFER_DST,
                    mem_usage: MemoryUsage.GPU_ONLY,
                    stride: viewInfo.byteStride,
                    size: viewInfo.byteLength
                });
                if (!_commandBuffer) {
                    _commandBuffer = gfx.createCommandBuffer();
                    _commandBuffer.initialize();
                }
                if (!_fence) {
                    _fence = gfx.createFence();
                    _fence.initialize();
                }
                _commandBuffer.begin();
                _commandBuffer.copyBuffer(view, buffer);
                _commandBuffer.end();
                gfx.submit({ commandBuffer: _commandBuffer }, _fence);
                gfx.waitFence(_fence);
            } else {
                buffer.initialize({
                    usage: usage,
                    mem_usage: MemoryUsage.CPU_TO_GPU,
                    stride: viewInfo.byteStride,
                    size: viewInfo.byteLength
                });
                buffer.update(view);
            }

            this._buffers[index] = buffer;
        }

        if ((buffer.info.usage & usage) != usage) {
            throw new Error("");
        }
        return buffer;
    }

    private onProgress(loaded: number, total: number, url: string) {
        console.log(`download: ${url}, progress: ${loaded / total * 100}`)
    }
}