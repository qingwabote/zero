// https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html

import Buffer, { BufferUsageBit } from "../gfx/Buffer.js";
import gfx, { Format, FormatInfos } from "../gfx.js";
import Mesh from "../Mesh.js";
import SubMesh, { Attribute } from "../SubMesh.js";
import Asset from "./Asset.js";
import Material from "../Material.js";
import Pass from "../Pass.js";
import Node from "../Node.js";
import Texture from "../gfx/Texture.js";
import MeshRenderer from "../MeshRenderer.js";

const attributeNames: Record<string, string> = {
    "POSITION": "a_position",
    "TEXCOORD_0": "a_texCoord"
}

const formatPart1Names: Record<string, string> = {
    "SCALAR": "R",
    "VEC2": "RG",
    "VEC3": "RGB"
}

const formatPart2Names: Record<number, string> = {
    5123: "16UI",
    5126: "32F"
}

export default class GLTF extends Asset {
    private _json: any;
    private _bin: ArrayBuffer | undefined;
    private _texture: Texture | undefined;

    private _buffers: Buffer[] = [];

    async load(url: string) {
        const res = url.match(/(.+)\/(.+)$/);
        if (!res) {
            return;
        }
        const parent = res[1];
        const name = res[2];
        const json = await Asset.loader.load(`${parent}/${name}.gltf`, "json");
        const [bin, blob] = await Promise.all([
            Asset.loader.load(`${parent}/${json.buffers[0].uri}`, "arraybuffer"),
            Asset.loader.load(`${parent}/${json.images[0].uri}`, "blob")
        ])

        const imageBitmap = await gfx.device.createImageBitmap(blob);
        const texture = gfx.device.createTexture({});
        texture.update(imageBitmap);

        this._texture = texture;
        this._bin = bin;
        this._json = json;
    }

    createScene(name: string): Node | null {
        if (!this._json || !this._bin || !this._texture) return null;

        const scenes: any[] = this._json.scenes;
        const scene = scenes.find(scene => scene.name == name);
        return this.createNode(this._json.nodes[scene.nodes[0]]);
    }

    private createNode(info: any, parent?: Node): Node {
        const node = new Node;
        if (info.translation) {
            node.position = info.translation;
        }
        if (info.children) {
            for (const idx of info.children) {
                const info = this._json.nodes[idx];
                node.addChild(this.createNode(info, node))
            }
        } else {
            const subMeshes: SubMesh[] = [];
            const materials: Material[] = [];
            const m = this._json.meshes[info.mesh];
            for (const primitive of m.primitives) {
                const vertexBuffers: Buffer[] = [];
                const attributes: Attribute[] = [];
                for (const name in primitive.attributes) {
                    const accessor = this._json.accessors[primitive.attributes[name]];
                    const format = (Format as any)[`${formatPart1Names[accessor.type]}${formatPart2Names[accessor.componentType]}`]
                    const attribute: Attribute = {
                        name: attributeNames[name] || name,
                        format,
                        buffer: vertexBuffers.length,
                        offset: accessor.byteOffset || 0
                    }
                    attributes.push(attribute);
                    vertexBuffers.push(this.getBuffer(accessor.bufferView, BufferUsageBit.VERTEX));
                }

                const accessor = this._json.accessors[primitive.indices];
                const format = (Format as any)[`${formatPart1Names[accessor.type]}${formatPart2Names[accessor.componentType]}`]
                const buffer = this.getBuffer(accessor.bufferView, BufferUsageBit.INDEX)

                const pass = new Pass('zero');
                pass.descriptorSet.textures[0] = this._texture!;
                const material = new Material([pass]);
                materials.push(material);

                subMeshes.push(new SubMesh(attributes, vertexBuffers, buffer, format))
            }

            const renderer = node.addComponent(MeshRenderer);
            renderer.mesh = new Mesh(subMeshes);
            renderer.materials = materials;
        }
        parent?.addChild(node);
        return node;
    }

    private getBuffer(index: number, usage: BufferUsageBit): Buffer {
        let buffer = this._buffers[index];
        if (!this._buffers[index]) {
            const viewInfo = this._json.bufferViews[index];
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