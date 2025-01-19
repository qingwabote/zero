// https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html
import { cache } from "assets";
import { device, load } from "boot";
import { bundle } from "bundling";
import { BufferInfo, BufferUsageFlagBits, Format, FormatInfos, IndexInput, IndexType, InputAssembler, PrimitiveTopology, VertexAttribute } from "gfx";
import { AnimationClip } from "../animating/AnimationClip.js";
import { MeshRenderer } from "../components/MeshRenderer.js";
import { Node } from "../core/Node.js";
import { mat4 } from "../core/math/mat4.js";
import { quat } from "../core/math/quat.js";
import { vec3 } from "../core/math/vec3.js";
import { vec4 } from "../core/math/vec4.js";
import { Mesh } from "../core/render/scene/Mesh.js";
import { SubMesh } from "../core/render/scene/SubMesh.js";
import { shaderLib } from "../core/shaderLib.js";
import { gfxUtil } from "../gfxUtil.js";
import { Skin } from "../skinning/Skin.js";
import { SkinnedMeshRenderer } from "../skinning/SkinnedMeshRenderer.js";
import { Effect } from "./Effect.js";
import { Texture } from "./Texture.js";
const attributeMap = {
    "POSITION": "position",
    "TEXCOORD_0": "uv",
    "NORMAL": "normal",
    "JOINTS_0": "skin_joints",
    "WEIGHTS_0": "skin_weights"
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
const materialFuncPhong = function (params) {
    return {
        effect: bundle.resolve("./effects/phong"),
        passes: [
            {
                macros: {
                    USE_SKIN: params.skin ? 1 : 0
                }
            },
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
    };
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
const mat4_a = mat4.create();
const mat4_b = mat4.create();
const rotationX90 = vec3.create(90);
const array_a = [];
export class GLTF {
    constructor() {
        this._skins = [];
        this._animationClips = [];
        this._meshes = [];
        this._instances = {};
    }
    get json() {
        return this._json;
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
    get meshes() {
        return this._meshes;
    }
    async load(url) {
        const res = url.match(/(.+)\/(.+)$/);
        if (!res) {
            return this;
        }
        const [, parent, name] = res;
        const json = JSON.parse(await load(`${parent}/${name}.gltf`, "text"));
        const [bin, textures] = await Promise.all([
            await load(`${parent}/${uri2path(json.buffers[0].uri)}`, "buffer"),
            json.images ? Promise.all(json.images.map((info) => cache(`${parent}/${uri2path(info.uri)}`, Texture))) : Promise.resolve([])
        ]);
        this._textures = textures;
        this._json = json;
        if (json.meshes) {
            const binView = new Uint8Array(bin);
            const buffers = [];
            function getBuffer(index, usage) {
                if (index in buffers) {
                    if ((buffers[index].info.usage & usage) != usage) {
                        throw new Error(`buffer.info.usage(${buffers[index].info.usage}) & usage(${usage})) != usage`);
                    }
                    return buffers[index];
                }
                const viewInfo = json.bufferViews[index];
                const info = new BufferInfo();
                info.usage = usage;
                info.size = viewInfo.byteLength;
                const buffer = device.createBuffer(info);
                buffer.update(binView, viewInfo.byteOffset || 0, viewInfo.byteLength, 0);
                return buffers[index] = buffer;
            }
            for (let i = 0; i < json.meshes.length; i++) {
                const info = json.meshes[i];
                const subMeshes = [];
                vec3.set(vec3_a, Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
                vec3.set(vec3_b, Number.MIN_VALUE, Number.MIN_VALUE, Number.MIN_VALUE);
                for (const primitive of info.primitives) {
                    const ia = new InputAssembler;
                    for (const key in primitive.attributes) {
                        const accessor = json.accessors[primitive.attributes[key]];
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
                        /**
                         * When byteStride of the referenced bufferView is not defined,
                         * it means that accessor elements are tightly packed,
                         * i.e., effective stride equals the size of the element.
                         * https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#data-alignment
                         */
                        let stride = json.bufferViews[accessor.bufferView].byteStride || 0;
                        if (!stride) {
                            for (const k in primitive.attributes) {
                                const acc = json.accessors[primitive.attributes[k]];
                                if (acc.bufferView != accessor.bufferView) {
                                    continue;
                                }
                                const fmt = Format[`${format_part1[acc.type]}${format_part2[acc.componentType]}`];
                                if (fmt == undefined) {
                                    throw new Error(`unknown format of accessor: type ${acc.type} componentType ${acc.componentType}`);
                                }
                                stride += FormatInfos[fmt].bytes;
                            }
                        }
                        const builtin = shaderLib.attributes[name];
                        const attribute = new VertexAttribute;
                        attribute.location = builtin.location;
                        attribute.format = format;
                        attribute.buffer = ia.vertexInput.buffers.size();
                        attribute.stride = stride;
                        ia.vertexInputState.attributes.add(attribute);
                        ia.vertexInput.buffers.add(getBuffer(accessor.bufferView, BufferUsageFlagBits.VERTEX));
                        // There seem to be no such thing like attribute.offset in gltf, the accessor.byteOffset is relative to bufferView
                        // I have to add single buffer multiple times with different offets if buffer is interleaved
                        ia.vertexInput.offsets.add(accessor.byteOffset || 0);
                    }
                    ia.vertexInputState.primitive = PrimitiveTopology.TRIANGLE_LIST;
                    const indexAccessor = json.accessors[primitive.indices];
                    const indexBuffer = getBuffer(indexAccessor.bufferView, BufferUsageFlagBits.INDEX);
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
                    if (json.bufferViews[indexAccessor.bufferView].byteStride) {
                        throw new Error('unsupported stride on index buffer');
                    }
                    subMeshes.push(new SubMesh(ia, {
                        count: indexAccessor.count,
                        first: (indexAccessor.byteOffset || 0) / (indexType == IndexType.UINT16 ? 2 : 4)
                    }));
                    const posAccessor = json.accessors[primitive.attributes['POSITION']];
                    vec3.min(vec3_a, vec3_a, posAccessor.min);
                    vec3.max(vec3_b, vec3_b, posAccessor.max);
                }
                this._meshes[i] = new Mesh(subMeshes, vec3_a, vec3_b);
            }
        }
        const node2parent = {};
        for (let i = 0; i < json.nodes.length; i++) {
            const node = json.nodes[i];
            if (node.children) {
                for (const child of node.children) {
                    node2parent[child] = i;
                }
            }
        }
        function node2path(idx) {
            const paths = [];
            do {
                paths.push(node2name(json.nodes[idx], idx));
                idx = node2parent[idx];
            } while (idx != undefined);
            return paths.reverse();
        }
        // skin
        for (const skin of json.skins || []) {
            const inverseBindMatrices = [];
            const accessor = json.accessors[skin.inverseBindMatrices];
            const bufferView = json.bufferViews[accessor.bufferView];
            for (let i = 0; i < accessor.count; i++) {
                inverseBindMatrices[i] = [...new Float32Array(bin, (accessor.byteOffset || 0) + bufferView.byteOffset + Float32Array.BYTES_PER_ELEMENT * 16 * i, 16)];
            }
            const joints = skin.joints.map(joint => node2path(joint));
            const jointData = new Float32Array(4 * 3 * skin.joints.length);
            for (let index = 0; index < skin.joints.length; index++) {
                const node = skin.joints[index];
                const parent2child = array_a;
                let parent = node;
                let i = 0;
                while (parent != undefined) {
                    parent2child[i++] = parent;
                    parent = node2parent[parent];
                }
                const world = mat4_a;
                while (i) {
                    const child = parent2child[--i];
                    const info = json.nodes[child];
                    const local = mat4_b;
                    if (info.matrix) {
                        local.splice(0, 16, ...info.matrix);
                    }
                    else {
                        mat4.fromTRS(local, info.translation || vec3.ZERO, info.rotation || quat.IDENTITY, info.scale || vec3.ONE);
                    }
                    if (parent == undefined) {
                        world.splice(0, 16, ...local);
                    }
                    else {
                        mat4.multiply_affine(world, world, local);
                    }
                    parent = child;
                }
                const out = mat4_b;
                gfxUtil.compressAffineMat4(jointData, 4 * 3 * index, mat4.multiply_affine(out, world, inverseBindMatrices[index]));
            }
            this._skins.push(new Skin(inverseBindMatrices, joints, jointData));
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
                            throw new Error(`unsupported accessor type: ${accessor.type}`);
                    }
                    output = new Float32Array(bin, (accessor.byteOffset || 0) + bufferView.byteOffset, accessor.count * components);
                    // if (components != bufferView.byteStride / Float32Array.BYTES_PER_ELEMENT) {
                    //     throw new Error;
                    // }
                }
                channels.push({ node: node2path(channel.target.node), path: channel.target.path, sampler: { input, output, interpolation: sampler.interpolation } });
            }
            this._animationClips.push(new AnimationClip(channels, animation.name));
        }
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
            const { effect, passes } = materialFunc({ index: -1, albedo: vec4.ONE, skin: false });
            const materialDefault = await this.materialLoad(effect, passes, macros);
            const materials = [];
            if (this._json.materials) {
                for (let i = 0; i < this._json.materials.length; i++) {
                    const info = this._json.materials[i];
                    const { effect, passes } = materialFunc(Object.assign(Object.assign({ index: i }, this._json.textures && {
                        texture: this._textures[(_b = this._json.textures[(_a = info.pbrMetallicRoughness.baseColorTexture) === null || _a === void 0 ? void 0 : _a.index]) === null || _b === void 0 ? void 0 : _b.source]
                    }), { albedo: info.pbrMetallicRoughness.baseColorFactor || vec4.ONE, skin: this._json.skins != undefined }));
                    materials.push(await this.materialLoad(effect, passes, macros));
                }
            }
            instance = new Instance(this, materials, materialDefault);
            this._instances[instanceKey] = instance;
        }
        return instance;
    }
    async materialLoad(effectPath, passOverriddens, macros) {
        const effect = (await cache(effectPath, Effect));
        const passes = await effect.getPasses(passOverriddens, macros);
        return { passes };
    }
}
GLTF.materialFuncPhong = materialFuncPhong;
class Instance {
    constructor(proto, _materials, _materialDefault) {
        this.proto = proto;
        this._materials = _materials;
        this._materialDefault = _materialDefault;
    }
    createScene(name) {
        const scene = this.proto.json.scenes.find(scene => scene.name == name);
        const wrapper = new Node(name);
        for (const index of scene.nodes) {
            const skinning = new Map;
            wrapper.addChild(this.createNode(index, skinning));
            for (const [index, nodes] of skinning) {
                const skin = this.proto.skins[index];
                const instance = skin.instantiate(wrapper);
                for (const node of nodes) {
                    const renderer = node.getComponent(SkinnedMeshRenderer);
                    renderer.skin = instance;
                }
            }
        }
        return wrapper;
    }
    createNode(index, skinning) {
        const info = this.proto.json.nodes[index];
        const node = new Node(node2name(info, index));
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
            let renderer;
            if (info.skin != undefined) {
                let nodes = skinning.get(info.skin);
                if (!nodes) {
                    skinning.set(info.skin, nodes = []);
                }
                nodes.push(node);
                renderer = node.addComponent(SkinnedMeshRenderer);
                // for bounding box
                if (!vec3.equals(node.euler, vec3.ZERO, 0)) {
                    throw new Error("hard code failed");
                }
                node.euler = rotationX90;
            }
            else {
                renderer = node.addComponent(MeshRenderer);
            }
            renderer.mesh = this.proto.meshes[info.mesh];
            renderer.materials = this.getMaterials(info.mesh);
        }
        if (info.children) {
            for (const idx of info.children) {
                node.addChild(this.createNode(idx, skinning));
            }
        }
        return node;
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
