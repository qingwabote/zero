// https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html
import { cache } from "assets";
import { device, load } from "boot";
import { bundle } from "bundling";
import { BufferInfo, BufferUsageFlagBits, Format, IndexInput, IndexType, InputAssembler, MemoryUsage, PrimitiveTopology, SubmitInfo, VertexAttribute } from "gfx";
import { MeshRenderer } from "../components/MeshRenderer.js";
import { SkinnedMeshRenderer } from "../components/SkinnedMeshRenderer.js";
import { Node } from "../core/Node.js";
import { vec3 } from "../core/math/vec3.js";
import { vec4 } from "../core/math/vec4.js";
import { Mesh } from "../core/render/scene/Mesh.js";
import { SubMesh } from "../core/render/scene/SubMesh.js";
import { shaderLib } from "../core/shaderLib.js";
import { Effect } from "./Effect.js";
import { Texture } from "./Texture.js";
const attributeMap = {
    "POSITION": "position",
    "TEXCOORD_0": "uv",
    "NORMAL": "normal",
    "JOINTS_0": "joints",
    "WEIGHTS_0": "weights"
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
const materialFuncPhong = function (params) {
    return [
        bundle.resolve("./effects/phong"),
        [
            {},
            Object.assign({ macros: {
                    USE_ALBEDO_MAP: params.texture ? 1 : 0,
                    USE_SKIN: params.skin ? 1 : 0
                }, props: {
                    albedo: params.albedo
                } }, params.texture &&
                {
                    textures: {
                        'albedoMap': params.texture
                    }
                })
        ]
    ];
};
const materialFuncHash = (function () {
    let materialFuncId = 0;
    const materialFuncIds = new Map;
    return function (func) {
        let id = materialFuncIds.get(func);
        if (id == undefined) {
            id = materialFuncId++;
            materialFuncIds.set(func, id);
        }
        return id;
    };
})();
const vec3_a = vec3.create();
const vec3_b = vec3.create();
export class GLTF {
    constructor() {
        this._skins = [];
        this._animationClips = [];
        this._buffers = [];
        this._meshes = [];
        this._instances = {};
    }
    get json() {
        return this._json;
    }
    get bin() {
        return this._bin;
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
        const [bin, textures] = await Promise.all([
            load(`${parent}/${uri2path(json.buffers[0].uri)}`, "buffer"),
            json.images ? Promise.all(json.images.map((info) => cache(`${parent}/${uri2path(info.uri)}`, Texture))) : Promise.resolve([])
        ]);
        this._textures = textures;
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
                let input;
                {
                    const accessor = json.accessors[sampler.input];
                    const bufferView = json.bufferViews[accessor.bufferView];
                    if (bufferView.byteStride != undefined) {
                        throw new Error;
                    }
                    input = new Float32Array(bin, (accessor.byteOffset || 0) + bufferView.byteOffset, accessor.count);
                }
                let output;
                {
                    const accessor = json.accessors[sampler.output];
                    const bufferView = json.bufferViews[accessor.bufferView];
                    let components;
                    switch (accessor.type) {
                        case 'VEC3':
                            components = 3;
                            break;
                        case 'VEC4':
                            components = 4;
                            break;
                        default:
                            throw `unsupported accessor type: ${accessor.type}`;
                    }
                    output = new Float32Array(bin, (accessor.byteOffset || 0) + bufferView.byteOffset, accessor.count * components);
                    // if (components != bufferView.byteStride / Float32Array.BYTES_PER_ELEMENT) {
                    //     throw new Error;
                    // }
                }
                channels.push({ node: node2path(channel.target.node), path: channel.target.path, sampler: { input, output, interpolation: sampler.interpolation } });
            }
            this._animationClips.push({ name: animation.name, channels });
        }
        this._bin = bin;
        this._json = json;
        return this;
    }
    async instantiate(macros, materialFunc = materialFuncPhong) {
        var _a, _b;
        let instanceKey = materialFuncHash(materialFunc).toString();
        if (macros) {
            const names = Object.keys(macros).sort();
            for (const name of names) {
                instanceKey += name + macros[name];
            }
        }
        let instance = this._instances[instanceKey];
        if (!instance) {
            const materialDefault = await this.materialLoad(...materialFunc({ albedo: vec4.ONE, skin: false }), macros);
            const materials = [];
            for (const info of this._json.materials || []) {
                let textureIdx = -1;
                if (((_a = info.pbrMetallicRoughness.baseColorTexture) === null || _a === void 0 ? void 0 : _a.index) != undefined) {
                    textureIdx = this._json.textures[(_b = info.pbrMetallicRoughness.baseColorTexture) === null || _b === void 0 ? void 0 : _b.index].source;
                }
                materials.push(await this.materialLoad(...materialFunc({
                    texture: this._textures[textureIdx],
                    albedo: info.pbrMetallicRoughness.baseColorFactor || vec4.ONE,
                    skin: this._json.skins != undefined
                }), macros));
            }
            instance = new Instance(this, materials, materialDefault);
            this._instances[instanceKey] = instance;
        }
        return instance;
    }
    getMesh(index) {
        if (index in this._meshes) {
            return this._meshes[index];
        }
        const subMeshes = [];
        vec3.set(vec3_a, Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
        vec3.set(vec3_b, Number.MIN_VALUE, Number.MIN_VALUE, Number.MIN_VALUE);
        for (const primitive of this._json.meshes[index].primitives) {
            const ia = new InputAssembler;
            for (const key in primitive.attributes) {
                const accessor = this._json.accessors[primitive.attributes[key]];
                const format = Format[`${format_part1[accessor.type]}${format_part2[accessor.componentType]}`];
                if (format == undefined) {
                    console.log(`unknown format of accessor: type ${accessor.type} componentType ${accessor.componentType}`);
                    continue;
                }
                const name = attributeMap[key];
                if (!name) {
                    // console.log(`unknown attribute: ${key}`);
                    continue;
                }
                const builtin = shaderLib.attributes[name];
                const attribute = new VertexAttribute;
                attribute.location = builtin.location;
                attribute.format = format;
                attribute.buffer = ia.vertexInput.buffers.size();
                attribute.offset = 0;
                attribute.stride = this._json.bufferViews[accessor.bufferView].byteStride || 0;
                ia.vertexInputState.attributes.add(attribute);
                ia.vertexInput.buffers.add(this.getBuffer(accessor.bufferView, BufferUsageFlagBits.VERTEX));
                ia.vertexInput.offsets.add(accessor.byteOffset || 0);
            }
            ia.vertexInputState.primitive = PrimitiveTopology.TRIANGLE_LIST;
            const indexAccessor = this._json.accessors[primitive.indices];
            const indexBuffer = this.getBuffer(indexAccessor.bufferView, BufferUsageFlagBits.INDEX);
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
            ia.indexInput = indexInput;
            if (this._json.bufferViews[indexAccessor.bufferView].byteStride) {
                throw new Error('unsupported stride on index buffer');
            }
            subMeshes.push(new SubMesh(ia, {
                count: indexAccessor.count,
                first: (indexAccessor.byteOffset || 0) / (indexType == IndexType.UINT16 ? 2 : 4)
            }));
            const posAccessor = this._json.accessors[primitive.attributes['POSITION']];
            vec3.min(vec3_a, vec3_a, posAccessor.min);
            vec3.max(vec3_b, vec3_b, posAccessor.max);
        }
        return this._meshes[index] = new Mesh(subMeshes, vec3_a, vec3_b);
    }
    getBuffer(index, usage) {
        if (index in this._buffers) {
            if ((this._buffers[index].info.usage & usage) != usage) {
                throw new Error(`buffer.info.usage(${this._buffers[index].info.usage}) & usage(${usage})) != usage`);
            }
            return this._buffers[index];
        }
        const viewInfo = this._json.bufferViews[index];
        let buffer;
        if (usage & BufferUsageFlagBits.VERTEX) {
            const info = new BufferInfo();
            info.usage = usage | BufferUsageFlagBits.TRANSFER_DST;
            info.mem_usage = MemoryUsage.GPU_ONLY;
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
            device.waitForFence(_fence);
        }
        else {
            const info = new BufferInfo();
            info.usage = usage;
            info.mem_usage = MemoryUsage.CPU_TO_GPU;
            info.size = viewInfo.byteLength;
            buffer = device.createBuffer(info);
            buffer.update(this._bin, viewInfo.byteOffset || 0, viewInfo.byteLength);
        }
        return this._buffers[index] = buffer;
    }
    async materialLoad(effectUrl, passOverriddens, macros) {
        const effect = await cache(effectUrl, Effect);
        const passes = await effect.getPasses(passOverriddens, macros);
        return { passes };
    }
}
class Instance {
    constructor(proto, _materials, _materialDefault) {
        this.proto = proto;
        this._materials = _materials;
        this._materialDefault = _materialDefault;
    }
    createScene(name) {
        const scene = name ? this.proto.json.scenes.find(scene => scene.name == name) : this.proto.json.scenes[0];
        if (!scene) {
            return null;
        }
        const node = new Node(name);
        for (const index of scene.nodes) {
            node.addChild(this.createNode(index, node));
        }
        return node;
    }
    createNode(index, root) {
        const info = this.proto.json.nodes[index];
        const node = new Node(node2name(info, index));
        if (!root) {
            root = node;
        }
        if (info.matrix) {
            node.matrix = info.matrix;
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
            this.addMeshRenderer(root, node, info);
        }
        if (info.children) {
            for (const idx of info.children) {
                node.addChild(this.createNode(idx, root));
            }
        }
        return node;
    }
    addMeshRenderer(root, node, info) {
        let renderer;
        if (info.skin != undefined) {
            const rdr = node.addComponent(SkinnedMeshRenderer);
            rdr.skin = this.proto.skins[info.skin];
            rdr.transform = root;
            renderer = rdr;
        }
        else {
            renderer = node.addComponent(MeshRenderer);
        }
        renderer.mesh = this.proto.getMesh(info.mesh);
        renderer.materials = this.getMaterials(info.mesh);
    }
    getMaterials(meshIndex) {
        var _a;
        const materials = [];
        for (const primitive of this.proto.json.meshes[meshIndex].primitives) {
            const material = primitive.material == undefined ? this._materialDefault : this._materials[primitive.material];
            // assert
            if (primitive.material != undefined &&
                ((_a = this.proto.json.materials[primitive.material].pbrMetallicRoughness.baseColorTexture) === null || _a === void 0 ? void 0 : _a.index) != undefined &&
                primitive.attributes['TEXCOORD_0'] == undefined) {
                console.log("not provided attribute: TEXCOORD_0");
                continue;
            }
            materials.push({ passes: [...material.passes] });
        }
        return materials;
    }
}
