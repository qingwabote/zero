import gfx, { Buffer, BufferUsageBit, Format, FormatInfos } from "../gfx.js";
import Mesh from "../Mesh.js";
import SubMesh, { Attribute } from "../SubMesh.js";
import Asset from "./Asset.js";

const map2engine: Record<string, string> = {
    "POSITION": "a_position"
}

export interface Node {
    name: string;
    mesh: Mesh;
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
        const [json, arrayBuffer] = await Promise.all([
            Asset.loader.load(`${parent}/${name}.gltf`, "json"),
            Asset.loader.load(`${parent}/${name}.bin`, "arraybuffer")
        ])

        // The gltf exported from blender doesn't support interleaving, neither do I, for now
        for (const node of json.nodes) {
            const subMeshes: SubMesh[] = [];
            const m = json.meshes[node.mesh];
            for (const primitive of m.primitives) {
                const vertexBuffers: Buffer[] = [];
                const attributes: Attribute[] = [];
                for (const name in primitive.attributes) {
                    const accessor = json.accessors[primitive.attributes[name]];
                    const format = Format.RGB32F // FIXME: We should read format from accessor, hard code for now
                    const attribute: Attribute = {
                        name: map2engine[name],
                        format,
                        binding: vertexBuffers.length
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
                const indexBuffer: Buffer = gfx.device.createBuffer({
                    usage: BufferUsageBit.INDEX,
                    stride: FormatInfos[Format.R8UI].size, // FIXME: We should read format from accessor, hard code for now
                    size: bufferView.byteLength
                });
                indexBuffer.update(new DataView(arrayBuffer, bufferView.byteOffset, bufferView.byteLength));

                subMeshes.push(new SubMesh(attributes, vertexBuffers, indexBuffer))
            }
            this._nodes.push({
                name: node.name,
                mesh: new Mesh(subMeshes)
            });
        }
    }
}