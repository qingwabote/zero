// https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html
import MeshRenderer from "../components/MeshRenderer.js";
import gfx, { Format } from "../gfx.js";
import { BufferUsageBit } from "../gfx/Buffer.js";
import mat4 from "../math/mat4.js";
import Node from "../Node.js";
import Material from "../render/Material.js";
import Mesh from "../render/Mesh.js";
import Pass from "../render/Pass.js";
import SubMesh from "../render/SubMesh.js";
import shaders from "../shaders.js";
import Asset from "./Asset.js";
const builtinAttributes = {
    "POSITION": "a_position",
    "TEXCOORD_0": "a_texCoord"
};
const formatPart1Names = {
    "SCALAR": "R",
    "VEC2": "RG",
    "VEC3": "RGB",
    "VEC4": "RGBA"
};
const formatPart2Names = {
    5123: "16UI",
    5125: "32UI",
    5126: "32F"
};
function getFormat(accessor) {
    const format = Format[`${formatPart1Names[accessor.type]}${formatPart2Names[accessor.componentType]}`];
    // if (format == undefined) {
    //     console.error(`unknown format of accessor: type ${accessor.type} componentType ${accessor.componentType}`)
    // }
    return format;
}
export default class GLTF extends Asset {
    _json;
    _bin;
    _buffers = [];
    _textures;
    async load(url) {
        const res = url.match(/(.+)\/(.+)$/);
        if (!res) {
            return;
        }
        const parent = res[1];
        const name = res[2];
        const json = await Asset.loader.load(`${parent}/${name}.gltf`, "json");
        const bin = await Asset.loader.load(`${parent}/${json.buffers[0].uri}`, "arraybuffer");
        const images = json.images;
        this._textures = await Promise.all(images.map(info => this.loadTexture(`${parent}/${info.uri}`)));
        this._bin = bin;
        this._json = json;
    }
    async loadTexture(url) {
        const blob = await Asset.loader.load(url, "blob");
        const imageBitmap = await gfx.device.createImageBitmap(blob);
        const texture = gfx.device.createTexture({});
        texture.update(imageBitmap);
        return texture;
    }
    createScene(name) {
        if (!this._json || !this._bin || !this._textures)
            return null;
        const scenes = this._json.scenes;
        const scene = scenes.find(scene => scene.name == name);
        return this.createNode(this._json.nodes[scene.nodes[0]]);
    }
    createNode(info, parent) {
        const node = new Node(info.name);
        if (info.matrix) {
            mat4.toRTS(info.matrix, node.rotation, node.position, node.scale);
        }
        else {
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
    createMesh(node, info) {
        const subMeshes = [];
        const materials = [];
        for (const primitive of info.primitives) {
            const vertexBuffers = [];
            const attributes = [];
            for (const name in primitive.attributes) {
                const accessor = this._json.accessors[primitive.attributes[name]];
                const attribute = {
                    name: builtinAttributes[name] || name,
                    format: getFormat(accessor),
                    buffer: vertexBuffers.length,
                    offset: accessor.byteOffset
                };
                attributes.push(attribute);
                vertexBuffers.push(this.getBuffer(accessor.bufferView, BufferUsageBit.VERTEX));
            }
            const accessor = this._json.accessors[primitive.indices];
            const buffer = this.getBuffer(accessor.bufferView, BufferUsageBit.INDEX);
            if (primitive.material != undefined) {
                const info = this._json.materials[primitive.material];
                const textureIdx = info.pbrMetallicRoughness.baseColorTexture?.index;
                const shader = shaders.getShader('zero', { USE_ALBEDO_MAP: textureIdx == undefined ? 0 : 1 });
                const pass = new Pass(shader);
                if (textureIdx != undefined) {
                    pass.descriptorSet.textures[0] = this._textures[this._json.textures[textureIdx].source];
                }
                const material = new Material([pass]);
                materials.push(material);
            }
            subMeshes.push(new SubMesh(attributes, vertexBuffers, buffer, getFormat(accessor), accessor.count, accessor.byteOffset));
        }
        const renderer = node.addComponent(MeshRenderer);
        renderer.mesh = new Mesh(subMeshes);
        renderer.materials = materials;
    }
    getBuffer(index, usage) {
        let buffer = this._buffers[index];
        if (!this._buffers[index]) {
            const viewInfo = this._json.bufferViews[index];
            // if (usage & BufferUsageBit.VERTEX) {
            //     console.assert(viewInfo.target == 34962)
            // } else {
            //     console.assert(viewInfo.target == 34963)
            // }
            const view = new DataView(this._bin, viewInfo.byteOffset, viewInfo.byteLength);
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
//# sourceMappingURL=GLTF.js.map