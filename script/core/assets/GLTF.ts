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
    5126: "32F",
    5123: "8UI"
}

export default class GLTF extends Asset {
    private _json: any;
    private _bin: ArrayBuffer | undefined;
    private _texture: Texture | undefined;

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

    createScene(name: string): Node {
        const rootNode = new Node;
        if (!this._json || !this._bin || !this._texture) return rootNode;

        const scenes: any[] = this._json.scenes;
        const scene = scenes.find(scene => scene.name == name);
        const root = this._json.nodes[scene.nodes[0]];
        const subMeshes: SubMesh[] = [];
        const materials: Material[] = [];
        const m = this._json.meshes[root.mesh];
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
                const viewInfo = this._json.bufferViews[accessor.bufferView];
                const view = new DataView(this._bin, viewInfo.byteOffset, viewInfo.byteLength)
                const buffer = gfx.device.createBuffer({
                    usage: BufferUsageBit.VERTEX,
                    stride: viewInfo.byteStride || FormatInfos[format].size,
                    size: viewInfo.byteLength
                });
                buffer.update(view);
                vertexBuffers.push(buffer);
            }

            const accessor = this._json.accessors[primitive.indices];
            const viewInfo = this._json.bufferViews[accessor.bufferView];
            const format = (Format as any)[`${formatPart1Names[accessor.type]}${formatPart2Names[accessor.componentType]}`]
            const buffer: Buffer = gfx.device.createBuffer({
                usage: BufferUsageBit.INDEX,
                stride: FormatInfos[format].size,
                size: viewInfo.byteLength
            });
            buffer.update(new DataView(this._bin, viewInfo.byteOffset, viewInfo.byteLength));

            const pass = new Pass('zero');
            pass.descriptorSet.textures[0] = this._texture;
            const material = new Material([pass]);
            materials.push(material);

            subMeshes.push(new SubMesh(attributes, vertexBuffers, buffer))
        }

        const renderer = rootNode.addComponent(MeshRenderer);
        renderer.mesh = new Mesh(subMeshes);
        renderer.materials = materials;

        return rootNode;
    }
}