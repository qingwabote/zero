import Buffer, { BufferUsageBit } from "../gfx/Buffer.js";
import gfx, { Format, FormatInfos } from "../gfx.js";
import Mesh from "../Mesh.js";
import SubMesh, { Attribute } from "../SubMesh.js";
import Asset from "./Asset.js";
import Material from "../Material.js";
import Pass from "../Pass.js";

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

export interface Node {
    name: string;
    mesh: Mesh;
    materials: Material[];
}

export default class GLTF extends Asset {
    private _nodes: Node[] = [];
    get nodes(): Node[] {
        return this._nodes;
    }

    async load(url: string) {
        const res = url.match(/(.+)\/(.+)$/);
        if (!res) {
            return;
        }
        const parent = res[1];
        const name = res[2];
        const json = await Asset.loader.load(`${parent}/${name}.gltf`, "json");
        const [arrayBuffer, blob] = await Promise.all([
            Asset.loader.load(`${parent}/${json.buffers[0].uri}`, "arraybuffer"),
            Asset.loader.load(`${parent}/${json.images[0].uri}`, "blob")
        ])

        const imageBitmap = await gfx.device.createImageBitmap(blob);
        const texture = gfx.device.createTexture({});
        texture.update(imageBitmap);

        // The gltf exported from blender doesn't support interleaving, neither do I, for now
        for (const node of json.nodes) {
            const subMeshes: SubMesh[] = [];
            const materials: Material[] = [];
            const m = json.meshes[node.mesh];
            for (const primitive of m.primitives) {
                const vertexBuffers: Buffer[] = [];
                const attributes: Attribute[] = [];
                for (const name in primitive.attributes) {
                    const accessor = json.accessors[primitive.attributes[name]];
                    const format = (Format as any)[`${formatPart1Names[accessor.type]}${formatPart2Names[accessor.componentType]}`]
                    const attribute: Attribute = {
                        name: attributeNames[name] || name,
                        format,
                        buffer: vertexBuffers.length
                    }
                    attributes.push(attribute);
                    const bufferView = json.bufferViews[accessor.bufferView];
                    const vertexBuffer = gfx.device.createBuffer({
                        usage: BufferUsageBit.VERTEX,
                        stride: FormatInfos[format].size,
                        size: bufferView.byteLength
                    });
                    vertexBuffer.update(new DataView(arrayBuffer, bufferView.byteOffset, bufferView.byteLength));
                    vertexBuffers.push(vertexBuffer);
                }

                const accessor = json.accessors[primitive.indices];
                const bufferView = json.bufferViews[accessor.bufferView];
                const format = (Format as any)[`${formatPart1Names[accessor.type]}${formatPart2Names[accessor.componentType]}`]
                const indexBuffer: Buffer = gfx.device.createBuffer({
                    usage: BufferUsageBit.INDEX,
                    stride: FormatInfos[format].size,
                    size: bufferView.byteLength
                });
                indexBuffer.update(new DataView(arrayBuffer, bufferView.byteOffset, bufferView.byteLength));

                const pass = new Pass('zero');
                pass.descriptorSet.textures[0] = texture;
                const material = new Material([pass]);
                materials.push(material);

                subMeshes.push(new SubMesh(attributes, vertexBuffers, indexBuffer))
            }
            this._nodes.push({
                name: node.name,
                mesh: new Mesh(subMeshes),
                materials
            });
        }
    }
}