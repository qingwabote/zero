// https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html

import { Asset, cache } from "assets";
import { device, load } from "boot";
import { bundle } from "bundling";
import { Buffer, BufferInfo, BufferUsageFlagBits, Format, FormatInfos, IndexInput, IndexType, InputAssembler, PrimitiveTopology, VertexAttribute } from "gfx";
import { MeshRenderer } from "../components/MeshRenderer.js";
import { SkinnedMeshRenderer } from "../components/SkinnedMeshRenderer.js";
import { Node } from "../core/Node.js";
import { Mat4 } from "../core/math/mat4.js";
import { Vec3, vec3 } from "../core/math/vec3.js";
import { Vec4, vec4 } from "../core/math/vec4.js";
import { Mesh } from "../core/render/scene/Mesh.js";
import { SubMesh } from "../core/render/scene/SubMesh.js";
import { shaderLib } from "../core/shaderLib.js";
import { AnimationClip } from "../marionette/AnimationClip.js";
import { Material } from "../scene/Material.js";
import { Skin } from "../scene/Skin.js";
import { Effect } from "./Effect.js";
import { Texture } from "./Texture.js";

const attributeMap: Record<string, keyof typeof shaderLib.attributes> = {
    "POSITION": "position",
    "TEXCOORD_0": "uv",
    "NORMAL": "normal",
    "JOINTS_0": "skin_joints",
    "WEIGHTS_0": "skin_weights"
}

const format_part1: Record<string, string> = {
    "SCALAR": "R",
    "VEC2": "RG",
    "VEC3": "RGB",
    "VEC4": "RGBA"
}

const format_part2: Record<number, string> = {
    5121: "8_UINT",
    5123: "16_UINT",
    5125: "32_UINT",
    5126: "32_SFLOAT"
}

function uri2path(uri: string) {
    return uri.replace(/%20/g, " ");
}

function node2name(node: any, index: number): string {
    return node.name == undefined ? `${index}` : node.name;
}

interface MaterialParams {
    index: number;
    albedo: Readonly<Vec4>;
    skin: boolean;
    texture?: Texture;
}

type MaterialFunc = (params: MaterialParams) => { effect: string, passes: Effect.PassOverridden[] };

const materialFuncPhong: MaterialFunc = function (params: MaterialParams) {
    return {
        effect: bundle.resolve("./effects/phong"),
        passes: [
            {
                macros: {
                    USE_SKIN: params.skin ? 1 : 0
                }
            },
            {
                macros: {
                    USE_ALBEDO_MAP: params.texture ? 1 : 0,
                    USE_SKIN: params.skin ? 1 : 0
                },
                props: {
                    albedo: params.albedo
                },
                ...params.texture &&
                {
                    textures: {
                        'albedoMap': params.texture
                    }
                }
            }
        ]
    }
}

const materialFuncHash = (function () {
    let materialFuncId = 0;
    const materialFuncIds: Map<MaterialFunc, number> = new Map;
    return function (func: MaterialFunc) {
        let id = materialFuncIds.get(func);
        if (id == undefined) {
            id = materialFuncId++;
            materialFuncIds.set(func, id);
        }
        return id;
    }
})();

const vec3_a = vec3.create();
const vec3_b = vec3.create();

const rotationX90: Readonly<Vec3> = vec3.create(90);

export class GLTF implements Asset {
    private _json: any;
    get json(): any {
        return this._json;
    }

    private _textures!: Texture[];
    get textures(): readonly Texture[] {
        return this._textures;
    }

    private _skins: Skin[] = [];
    get skins(): readonly Skin[] {
        return this._skins;
    }

    private _animationClips: AnimationClip[] = [];
    get animationClips(): readonly AnimationClip[] {
        return this._animationClips;
    }

    private _meshes: Mesh[] = [];
    public get meshes(): readonly Mesh[] {
        return this._meshes;
    }

    private _instances: Record<string, Instance> = {};

    async load(url: string): Promise<this> {
        const res = url.match(/(.+)\/(.+)$/);
        if (!res) {
            return this;
        }

        const [, parent, name] = res;
        const json = JSON.parse(await load(`${parent}/${name}.gltf`, "text"));
        const [bin, textures] = await Promise.all([
            await load(`${parent}/${uri2path(json.buffers[0].uri)}`, "buffer"),
            json.images ? Promise.all((json.images as []).map((info: any) => cache(`${parent}/${uri2path(info.uri)}`, Texture))) : Promise.resolve([])
        ]);
        this._textures = textures;
        this._json = json;

        const node2parent: Record<number, number> = {};
        for (let i = 0; i < json.nodes.length; i++) {
            const node = json.nodes[i];
            if (node.children) {
                for (const child of node.children) {
                    node2parent[child] = i;
                }
            }
        }

        if (json.meshes) {
            const binView = new Uint8Array(bin);
            const buffers: Buffer[] = [];
            function getBuffer(index: number, usage: BufferUsageFlagBits): Buffer {
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
                buffer.update(binView, viewInfo.byteOffset || 0, viewInfo.byteLength);

                return buffers[index] = buffer;
            }
            for (let i = 0; i < json.meshes.length; i++) {
                const info = json.meshes[i];
                const subMeshes: SubMesh[] = [];
                vec3.set(vec3_a, Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
                vec3.set(vec3_b, Number.MIN_VALUE, Number.MIN_VALUE, Number.MIN_VALUE);
                for (const primitive of info.primitives) {
                    const ia = new InputAssembler;
                    for (const key in primitive.attributes) {
                        const accessor = json.accessors[primitive.attributes[key]];
                        const format: Format = (Format as any)[`${format_part1[accessor.type]}${format_part2[accessor.componentType]}`];
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
                        let stride: number = json.bufferViews[accessor.bufferView].byteStride || 0;
                        if (!stride) {
                            for (const k in primitive.attributes) {
                                const acc = json.accessors[primitive.attributes[k]];
                                if (acc.bufferView != accessor.bufferView) {
                                    continue;
                                }

                                const fmt: Format = (Format as any)[`${format_part1[acc.type]}${format_part2[acc.componentType]}`];
                                if (fmt == undefined) {
                                    throw new Error(`unknown format of accessor: type ${acc.type} componentType ${acc.componentType}`);
                                }
                                stride += FormatInfos[fmt].bytes;
                            }
                        }

                        const builtin = shaderLib.attributes[name];
                        const attribute: VertexAttribute = new VertexAttribute;
                        attribute.location = builtin.location;
                        attribute.format = format;
                        attribute.buffer = ia.vertexInput.buffers.size();
                        attribute.stride = stride;
                        ia.vertexInputState.attributes.add(attribute)
                        ia.vertexInput.buffers.add(getBuffer(accessor.bufferView, BufferUsageFlagBits.VERTEX))
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
                    let indexType: IndexType;
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
                        throw new Error('unsupported stride on index buffer')
                    }

                    subMeshes.push(
                        new SubMesh(
                            ia,
                            {
                                count: indexAccessor.count,
                                first: (indexAccessor.byteOffset || 0) / (indexType == IndexType.UINT16 ? 2 : 4)
                            }
                        )
                    )

                    const posAccessor = json.accessors[primitive.attributes['POSITION']];
                    vec3.min(vec3_a, vec3_a, posAccessor.min);
                    vec3.max(vec3_b, vec3_b, posAccessor.max);
                }

                this._meshes[i] = new Mesh(subMeshes, vec3_a, vec3_b);
            }
        }

        function node2path(idx: number) {
            const paths: string[] = [];
            do {
                paths.push(node2name(json.nodes[idx], idx));
                idx = node2parent[idx];
            } while (idx != undefined);
            return paths.reverse();
        }

        // skin
        for (const skin of json.skins || []) {
            const inverseBindMatrices: Mat4[] = [];
            const accessor = json.accessors[skin.inverseBindMatrices];
            const bufferView = json.bufferViews[accessor.bufferView];
            for (let i = 0; i < accessor.count; i++) {
                inverseBindMatrices[i] = [...new Float32Array(bin, (accessor.byteOffset || 0) + bufferView.byteOffset + Float32Array.BYTES_PER_ELEMENT * 16 * i, 16)] as Mat4;
            }
            const joints: string[][] = (skin.joints as Array<number>).map(joint => node2path(joint));
            this._skins.push(new Skin(inverseBindMatrices, joints));
        }

        // animation
        for (const animation of json.animations || []) {
            const channels: AnimationClip.Channel[] = []
            for (const channel of animation.channels) {
                const sampler = animation.samplers[channel.sampler];

                // the input/output pair: 
                // a set of floating-point scalar values representing linear time in seconds; 
                // and a set of vectors or scalars representing the animated property. 
                let input: Float32Array;
                {
                    const accessor = json.accessors[sampler.input];
                    const bufferView = json.bufferViews[accessor.bufferView];
                    if (bufferView.byteStride != undefined) {
                        throw new Error;
                    }
                    input = new Float32Array(bin, (accessor.byteOffset || 0) + bufferView.byteOffset, accessor.count);
                }
                let output: Float32Array;
                {
                    const accessor = json.accessors[sampler.output];
                    const bufferView = json.bufferViews[accessor.bufferView];
                    let components: number;
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

                channels.push({ node: node2path(channel.target.node), path: channel.target.path, sampler: { input, output, interpolation: sampler.interpolation } })
            }
            this._animationClips.push({ name: animation.name, channels });
        }

        return this;
    }

    async instantiate(macros?: Record<string, number>, materialFunc = materialFuncPhong): Promise<Instance> {
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
            const materials: Material.Readonly[] = []
            if (this._json.materials) {
                for (let i = 0; i < this._json.materials.length; i++) {
                    const info = this._json.materials[i];
                    const { effect, passes } = materialFunc({
                        index: i,
                        ...this._json.textures && {
                            texture: this._textures[this._json.textures[info.pbrMetallicRoughness.baseColorTexture?.index]?.source]
                        },
                        albedo: info.pbrMetallicRoughness.baseColorFactor || vec4.ONE,
                        skin: this._json.skins != undefined
                    })
                    materials.push(await this.materialLoad(effect, passes, macros));
                }
            }
            instance = new Instance(this, materials, materialDefault);
            this._instances[instanceKey] = instance;
        }
        return instance;
    }

    private async materialLoad(effectPath: string, passOverriddens: readonly Readonly<Effect.PassOverridden>[], macros?: Record<string, number>) {
        const effect = (await cache(effectPath, Effect))
        const passes = await effect.getPasses(passOverriddens, macros);
        return { passes };
    }
}
GLTF.materialFuncPhong = materialFuncPhong;

class Instance {
    constructor(readonly proto: GLTF, private readonly _materials: Material.Readonly[], private readonly _materialDefault: Material) { }

    createScene(name: string): Node {
        const scene = (this.proto.json.scenes as any[]).find(scene => scene.name == name);
        const root = new Node(name);
        for (const index of scene.nodes) {
            const skinning: Map<number, Node[]> = new Map;
            root.addChild(this.createNode(index, root, skinning));
            for (const [index, nodes] of skinning) {
                const skin = this.proto.skins[index];
                const instance = skin.instantiate(root);
                for (const node of nodes) {
                    const renderer = node.getComponent(SkinnedMeshRenderer)!;
                    renderer.skin = instance;
                }
            }
        }
        return root;
    }

    private createNode(index: number, root: Node, skinning: Map<number, Node[]>): Node {
        const info = this.proto.json.nodes[index];
        const node = new Node(node2name(info, index));
        if (info.matrix) {
            node.matrix = info.matrix;
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
            let renderer: MeshRenderer;
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
            } else {
                renderer = node.addComponent(MeshRenderer);
            }
            renderer.mesh = this.proto.meshes[info.mesh];
            renderer.materials = this.getMaterials(info.mesh);
        }

        if (info.children) {
            for (const idx of info.children) {
                node.addChild(this.createNode(idx, root, skinning));
            }
        }
        return node;
    }

    private getMaterials(meshIndex: number) {
        const materials: Material[] = [];
        for (const primitive of this.proto.json.meshes[meshIndex].primitives) {
            const material = primitive.material == undefined ? this._materialDefault : this._materials[primitive.material];
            // assert
            if (primitive.material != undefined &&
                this.proto.json.materials[primitive.material].pbrMetallicRoughness.baseColorTexture?.index != undefined &&
                primitive.attributes['TEXCOORD_0'] == undefined) {
                console.log("not provided attribute: TEXCOORD_0")
                continue;
            }
            materials.push({ passes: [...material.passes] });
        }
        return materials;
    }
}

export declare namespace GLTF {
    export { MaterialParams, MaterialFunc, materialFuncPhong }
}