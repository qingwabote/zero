// https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html
import { cache } from "assets";
import { device, load } from "boot";
import { bundle } from "bundling";
import { BufferInfo, BufferUsageFlagBits, Format, IndexInput, IndexType, InputAssemblerInfo, MemoryUsage, SubmitInfo, VertexAttribute, VertexInput } from "gfx";
import { MaterialInstance } from "../MaterialInstance.js";
import { MeshRenderer } from "../components/MeshRenderer.js";
import { SkinnedMeshRenderer } from "../components/SkinnedMeshRenderer.js";
import { Node } from "../core/Node.js";
import { mat4 } from "../core/math/mat4.js";
import { vec4 } from "../core/math/vec4.js";
import { SubMesh } from "../core/render/scene/SubMesh.js";
import { Effect } from "./Effect.js";
import { Material } from "./Material.js";
import { Texture } from "./Texture.js";
const builtinAttributes = {
    "POSITION": "a_position",
    "TEXCOORD_0": "a_texCoord",
    "NORMAL": "a_normal",
    "JOINTS_0": "a_joints",
    "WEIGHTS_0": "a_weights"
};
const format_part1 = {
    "SCALAR": "R",
    "VEC2": "RG",
    "VEC3": "RGB",
    "VEC4": "RGBA"
};
const format_part2 = {
    5121: "8_UINT",
    5123: "16_UINT",
    5125: "32_UINT",
    5126: "32_SFLOAT"
};
function uri2path(uri) {
    return uri.replace(/%20/g, " ");
}
function node2name(node, index) {
    return node.name == undefined ? `${index}` : node.name;
}
let _commandBuffer;
let _fence;
async function materialFuncDefault(params) {
    const phong = await bundle.cache("./effects/phong", Effect);
    const passes = await phong.createPasses([
        {},
        {
            macros: {
                USE_ALBEDO_MAP: params.texture ? 1 : 0,
                USE_SKIN: params.skin ? 1 : 0
            },
            props: {
                albedo: params.albedo
            }
        }
    ]);
    if (params.texture) {
        passes[1].setTexture('albedoMap', params.texture.impl);
    }
    return new Material(passes);
}
export class GLTF {
    constructor() {
        this._buffers = [];
        this._skins = [];
        this._animationClips = [];
        // private onProgress(loaded: number, total: number, url: string) {
        //     console.log(`download: ${url}, progress: ${loaded / total * 100}`)
        // }
    }
    get json() {
        return this._json;
    }
    get bin() {
        return this._bin;
    }
    get buffers() {
        return this._buffers;
    }
    get textures() {
        return this._textures;
    }
    get skins() {
        return this._skins;
    }
    get animationClips() {
        return this._animationClips;
    }
    async load(url) {
        const res = url.match(/(.+)\/(.+)$/);
        if (!res) {
            return this;
        }
        const [, parent, name] = res;
        const json = JSON.parse(await load(`${parent}/${name}.gltf`, "text"));
        const bin = await load(`${parent}/${uri2path(json.buffers[0].uri)}`, "buffer");
        const json_images = json.images || [];
        this._textures = await Promise.all(json_images.map((info) => cache(`${parent}/${uri2path(info.uri)}`, Texture)));
        const child2parent = {};
        for (let i = 0; i < json.nodes.length; i++) {
            const node = json.nodes[i];
            if (!node.children) {
                continue;
            }
            for (const child of node.children) {
                child2parent[child] = i;
            }
        }
        function node2path(idx) {
            const paths = [];
            do {
                paths.push(node2name(json.nodes[idx], idx));
                idx = child2parent[idx];
            } while (idx != undefined);
            return paths.reverse();
        }
        // skin
        for (const skin of json.skins || []) {
            const inverseBindMatrices = [];
            const accessor = json.accessors[skin.inverseBindMatrices];
            const bufferView = json.bufferViews[accessor.bufferView];
            for (let i = 0; i < accessor.count; i++) {
                inverseBindMatrices[i] = new Float32Array(bin, (accessor.byteOffset || 0) + bufferView.byteOffset + Float32Array.BYTES_PER_ELEMENT * 16 * i, 16);
            }
            const joints = skin.joints.map(joint => node2path(joint));
            this._skins.push({ inverseBindMatrices, joints });
        }
        // animation
        for (const animation of json.animations || []) {
            const channels = [];
            for (const channel of animation.channels) {
                const sampler = animation.samplers[channel.sampler];
                // the input/output pair: 
                // a set of floating-point scalar values representing linear time in seconds; 
                // and a set of vectors or scalars representing the animated property. 
                let accessor = json.accessors[sampler.input];
                let bufferView = json.bufferViews[accessor.bufferView];
                if (bufferView.byteStride != undefined) {
                    throw new Error;
                }
                const input = new Float32Array(bin, (accessor.byteOffset || 0) + bufferView.byteOffset, accessor.count);
                accessor = json.accessors[sampler.output];
                bufferView = json.bufferViews[accessor.bufferView];
                let components;
                switch (accessor.type) {
                    case 'VEC3':
                        components = 3;
                        break;
                    case 'VEC4':
                        components = 4;
                        break;
                    default:
                        throw new Error(`unsupported accessor type: ${accessor.type}`);
                }
                const output = new Float32Array(bin, (accessor.byteOffset || 0) + bufferView.byteOffset, accessor.count * components);
                const interpolation = sampler.interpolation;
                if (components != bufferView.byteStride / Float32Array.BYTES_PER_ELEMENT) {
                    throw new Error;
                }
                channels.push({ node: node2path(channel.target.node), path: channel.target.path, sampler: { input, output, interpolation } });
            }
            this._animationClips.push({ name: animation.name, channels });
        }
        this._bin = bin;
        this._json = json;
        return this;
    }
    async instantiate(materialFunc = materialFuncDefault) {
        var _a, _b;
        const materialDefault = await materialFunc({
            albedo: vec4.ONE,
            skin: false
        });
        const materials = [];
        for (const info of this._json.materials || []) {
            let textureIdx = -1;
            if (((_a = info.pbrMetallicRoughness.baseColorTexture) === null || _a === void 0 ? void 0 : _a.index) != undefined) {
                textureIdx = this._json.textures[(_b = info.pbrMetallicRoughness.baseColorTexture) === null || _b === void 0 ? void 0 : _b.index].source;
            }
            materials.push(await materialFunc({
                texture: this._textures[textureIdx],
                albedo: info.pbrMetallicRoughness.baseColorFactor || vec4.ONE,
                skin: this._json.skins != undefined,
            }));
        }
        return new GLTFInstance(this, materials, materialDefault);
    }
    getBuffer(index, usage) {
        let buffer = this._buffers[index];
        if (!this._buffers[index]) {
            const viewInfo = this._json.bufferViews[index];
            if (usage & BufferUsageFlagBits.VERTEX) {
                const info = new BufferInfo();
                info.usage = usage | BufferUsageFlagBits.TRANSFER_DST;
                info.mem_usage = MemoryUsage.GPU_ONLY;
                info.stride = viewInfo.byteStride | 0;
                info.size = viewInfo.byteLength;
                buffer = device.createBuffer(info);
                if (!_commandBuffer) {
                    _commandBuffer = device.createCommandBuffer();
                }
                if (!_fence) {
                    _fence = device.createFence();
                }
                _commandBuffer.begin();
                _commandBuffer.copyBuffer(this._bin, buffer, viewInfo.byteOffset || 0, viewInfo.byteLength);
                _commandBuffer.end();
                const submitInfo = new SubmitInfo;
                submitInfo.commandBuffer = _commandBuffer;
                device.queue.submit(submitInfo, _fence);
                device.queue.waitFence(_fence);
            }
            else {
                const info = new BufferInfo();
                info.usage = usage;
                info.mem_usage = MemoryUsage.CPU_TO_GPU;
                info.stride = viewInfo.byteStride | 0;
                info.size = viewInfo.byteLength;
                buffer = device.createBuffer(info);
                buffer.update(this._bin, viewInfo.byteOffset || 0, viewInfo.byteLength);
            }
            this._buffers[index] = buffer;
        }
        if ((buffer.info.usage & usage) != usage) {
            throw new Error("buffer.info.usage & usage) != usage");
        }
        return buffer;
    }
}
export class GLTFInstance {
    constructor(gltf, _materials, _materialDefault) {
        this.gltf = gltf;
        this._materials = _materials;
        this._materialDefault = _materialDefault;
    }
    createScene(name, materialInstancing = false) {
        if (!this.gltf.json || !this.gltf.bin || !this.gltf.textures)
            return null;
        const scene = this.gltf.json.scenes.find(scene => scene.name == name || name == undefined);
        const node = new Node(name);
        for (const index of scene.nodes) {
            node.addChild(this.createNode(index, materialInstancing, node));
        }
        return node;
    }
    createNode(index, materialInstancing, root) {
        const info = this.gltf.json.nodes[index];
        const node = new Node(node2name(info, index));
        if (!root) {
            root = node;
        }
        if (info.matrix) {
            mat4.toTRS(info.matrix, node.position, node.rotation, node.scale);
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
        }
        if (info.mesh != undefined) {
            const [mesh, materials] = this.createMesh(this.gltf.json.meshes[info.mesh], materialInstancing);
            const renderer = node.addComponent(info.skin != undefined ? SkinnedMeshRenderer : MeshRenderer);
            renderer.mesh = mesh;
            renderer.materials = materials;
            if (renderer instanceof SkinnedMeshRenderer) {
                renderer.skin = this.gltf.skins[info.skin];
                renderer.transform = root;
            }
        }
        if (info.children) {
            for (const idx of info.children) {
                node.addChild(this.createNode(idx, materialInstancing, root));
            }
        }
        return node;
    }
    createMesh(info, materialInstancing) {
        var _a;
        const subMeshes = [];
        const materials = [];
        for (const primitive of info.primitives) {
            let material = primitive.material == undefined ? this._materialDefault : this._materials[primitive.material];
            if (materialInstancing) {
                material = new MaterialInstance(material);
            }
            // assert
            if (primitive.material != undefined &&
                ((_a = this.gltf.json.materials[primitive.material].pbrMetallicRoughness.baseColorTexture) === null || _a === void 0 ? void 0 : _a.index) != undefined &&
                primitive.attributes['TEXCOORD_0'] == undefined) {
                console.log("not provided attribute: TEXCOORD_0");
                continue;
            }
            const iaInfo = new InputAssemblerInfo;
            const vertexInput = new VertexInput;
            for (const key in primitive.attributes) {
                const accessor = this.gltf.json.accessors[primitive.attributes[key]];
                const format = Format[`${format_part1[accessor.type]}${format_part2[accessor.componentType]}`];
                if (format == undefined) {
                    console.log(`unknown format of accessor: type ${accessor.type} componentType ${accessor.componentType}`);
                    continue;
                }
                const name = builtinAttributes[key];
                if (!name) {
                    // console.log(`unknown attribute: ${key}`);
                    continue;
                }
                const attribute = new VertexAttribute;
                attribute.name = name;
                attribute.format = format;
                attribute.buffer = vertexInput.buffers.size();
                attribute.offset = 0;
                iaInfo.vertexAttributes.add(attribute);
                vertexInput.buffers.add(this.gltf.getBuffer(accessor.bufferView, BufferUsageFlagBits.VERTEX));
                vertexInput.offsets.add(accessor.byteOffset || 0);
            }
            iaInfo.vertexInput = vertexInput;
            const indexAccessor = this.gltf.json.accessors[primitive.indices];
            const indexBuffer = this.gltf.getBuffer(indexAccessor.bufferView, BufferUsageFlagBits.INDEX);
            materials.push(material);
            if (indexAccessor.type != "SCALAR") {
                throw new Error("unsupported index type");
            }
            let indexType;
            switch (indexAccessor.componentType) {
                case 5123:
                    indexType = IndexType.UINT16;
                    break;
                case 5125:
                    indexType = IndexType.UINT32;
                    break;
                default:
                    throw new Error("unsupported index type");
            }
            const indexInput = new IndexInput;
            indexInput.buffer = indexBuffer;
            indexInput.type = indexType;
            iaInfo.indexInput = indexInput;
            const posAccessor = this.gltf.json.accessors[primitive.attributes['POSITION']];
            subMeshes.push(new SubMesh(device.createInputAssembler(iaInfo), posAccessor.min, posAccessor.max, {
                count: indexAccessor.count,
                first: (indexAccessor.byteOffset || 0) / (indexBuffer.info.stride || (indexType == IndexType.UINT16 ? 2 : 4))
            }));
        }
        return [{ subMeshes }, materials];
    }
}