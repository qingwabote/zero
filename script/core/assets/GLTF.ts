// https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html

import gfx, { Format } from "../gfx.js";
import Buffer, { BufferUsageBit } from "../gfx/Buffer.js";
import Texture from "../gfx/Texture.js";
import Material from "../Material.js";
import mat4 from "../math/mat4.js";
import { Quat } from "../math/quat.js";
import { Vec3 } from "../math/vec3.js";
import Mesh from "../Mesh.js";
import MeshRenderer from "../MeshRenderer.js";
import Node from "../Node.js";
import Pass from "../Pass.js";
import shaderLib from "../shaderLib.js";
import SubMesh, { Attribute } from "../SubMesh.js";
import Asset from "./Asset.js";

const builtinAttributes: Record<string, string> = {
    "POSITION": "a_position",
    "TEXCOORD_0": "a_texCoord"
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

function getFormat(accessor: any): Format {
    const format: Format = (Format as any)[`${formatPart1Names[accessor.type]}${formatPart2Names[accessor.componentType]}`];
    // if (format == undefined) {
    //     console.error(`unknown format of accessor: type ${accessor.type} componentType ${accessor.componentType}`)
    // }
    return format;
}

export default class GLTF extends Asset {
    private _json: any;
    private _bin: ArrayBuffer | undefined;

    private _buffers: Buffer[] = [];
    private _textures: Texture[] | undefined;

    async load(url: string) {
        const res = url.match(/(.+)\/(.+)$/);
        if (!res) {
            return;
        }
        const parent = res[1];
        const name = res[2];
        const json = await Asset.loader.load(`${parent}/${name}.gltf`, "json");
        const bin = await Asset.loader.load(`${parent}/${json.buffers[0].uri}`, "arraybuffer");

        const images: any[] = json.images;
        this._textures = await Promise.all(images.map(info => this.loadTexture(`${parent}/${info.uri}`)));

        this._bin = bin;
        this._json = json;
    }

    private async loadTexture(url: string): Promise<Texture> {
        const blob = await Asset.loader.load(url, "blob");
        const imageBitmap = await gfx.device.createImageBitmap(blob);
        const texture = gfx.device.createTexture({});
        texture.update(imageBitmap);
        return texture;
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
            // const m = mat4.fromRTS(mat4.create(), node.rotation, node.position, node.scale);
            // const q = quat.create();
            // const v = vec3.create();
            // const s = vec3.create();
            // mat4.toRTS(m, q, v, s);
            // console.log("rotation:", node.rotation, q)
            // console.log("position:", node.position, v)
            // console.log("scale:", node.scale, s)
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
            const attributes: Attribute[] = [];
            for (const name in primitive.attributes) {
                const accessor = this._json.accessors[primitive.attributes[name]];
                const attribute: Attribute = {
                    name: builtinAttributes[name] || name,
                    format: getFormat(accessor),
                    buffer: vertexBuffers.length,
                    offset: accessor.byteOffset
                }
                attributes.push(attribute);
                vertexBuffers.push(this.getBuffer(accessor.bufferView, BufferUsageBit.VERTEX));
            }

            const accessor = this._json.accessors[primitive.indices];
            const buffer = this.getBuffer(accessor.bufferView, BufferUsageBit.INDEX);

            if (primitive.material != undefined) {
                const info = this._json.materials[primitive.material];
                const textureIdx: number = info.pbrMetallicRoughness.baseColorTexture?.index;
                const shader = shaderLib.getShader('zero', { USE_ALBEDO_MAP: textureIdx == undefined ? 0 : 1 })
                const pass = new Pass(shader);
                if (textureIdx != undefined) {
                    pass.descriptorSet.textures[0] = this._textures![this._json.textures[textureIdx].source];
                }
                const material = new Material([pass]);
                materials.push(material);
            }

            subMeshes.push(new SubMesh(attributes, vertexBuffers, buffer, getFormat(accessor), accessor.count, accessor.byteOffset))
        }

        const renderer = node.addComponent(MeshRenderer);
        renderer.mesh = new Mesh(subMeshes);
        renderer.materials = materials;
    }

    private getBuffer(index: number, usage: BufferUsageBit): Buffer {
        let buffer = this._buffers[index];
        if (!this._buffers[index]) {
            const viewInfo = this._json.bufferViews[index];
            // if (usage & BufferUsageBit.VERTEX) {
            //     console.assert(viewInfo.target == 34962)
            // } else {
            //     console.assert(viewInfo.target == 34963)
            // }
            const view = new DataView(this._bin!, viewInfo.byteOffset, viewInfo.byteLength)
            buffer = gfx.device.createBuffer({
                usage: usage,
                stride: viewInfo.byteStride,
                size: viewInfo.byteLength
            });
            buffer.update(view);
            this._buffers[index] = buffer;
        }

        console.assert(buffer.info.usage == usage);
        return buffer;
    }
}