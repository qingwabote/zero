// https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html

import MeshRenderer from "../components/MeshRenderer.js";
import SkinnedMeshRenderer from "../components/SkinnedMeshRenderer.js";
import Asset from "../core/Asset.js";
import Buffer, { BufferUsageFlagBits, MemoryUsage } from "../core/gfx/Buffer.js";
import CommandBuffer from "../core/gfx/CommandBuffer.js";
import Fence from "../core/gfx/Fence.js";
import Format from "../core/gfx/Format.js";
import { IndexType } from "../core/gfx/InputAssembler.js";
import { CullMode, PassState, PrimitiveTopology } from "../core/gfx/Pipeline.js";
import mat4, { Mat4 } from "../core/math/mat4.js";
import { Quat } from "../core/math/quat.js";
import { Vec3 } from "../core/math/vec3.js";
import vec4, { Vec4 } from "../core/math/vec4.js";
import Node from "../core/Node.js";
import Pass from "../core/scene/Pass.js";
import ShaderLib from "../core/ShaderLib.js";
import MaterialInstance from "../MaterialInstance.js";
import PhaseFlag from "../render/PhaseFlag.js";
import Animation, { Channel } from "./Animation.js";
import Material from "./Material.js";
import Mesh, { SubMesh, VertexAttribute } from "./Mesh.js";
import Skin from "./Skin.js";
import Texture from "./Texture.js";

interface MaterialMacros {
    USE_SHADOW_MAP?: 0 | 1;
    USE_SKIN?: 0 | 1;
}

interface MaterialValues {
    albedo?: Vec4;
    texture?: Texture;
}

const builtinAttributes: Record<string, string> = {
    "POSITION": "a_position",
    "TEXCOORD_0": "a_texCoord",
    "NORMAL": "a_normal",
    "JOINTS_0": "a_joints",
    "WEIGHTS_0": "a_weights"
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
    return uri.replaceAll("%20", " ");
}

let _commandBuffer: CommandBuffer;
let _fence: Fence;

export default class GLTF extends Asset {
    private _json: any;
    get json(): any {
        return this._json;
    }

    private _bin: ArrayBuffer | undefined;

    private _buffers: Buffer[] = [];

    private _textures: Texture[] = [];
    get textures(): Texture[] {
        return this._textures;
    }

    private _default_material!: Material;

    private _materials: Material[] = [];

    private _skins: Skin[] = [];

    private _animations: Animation[] = [];
    get animations(): readonly Animation[] {
        return this._animations;
    }

    async load(url: string, USE_SHADOW_MAP: 0 | 1 = 0): Promise<this> {
        const res = url.match(/(.+)\/(.+)$/);
        if (!res) {
            return this;
        }

        const [, parent, name] = res;
        const json = JSON.parse(await loader.load(`${parent}/${name}.gltf`, "text", this.onProgress));
        const bin = await loader.load(`${parent}/${uri2path(json.buffers[0].uri)}`, "arraybuffer", this.onProgress);
        const json_images = json.images || [];
        const textures = await Promise.all(json_images.map((info: any) => Asset.cache.load(`${parent}/${uri2path(info.uri)}`, Texture)));

        this._default_material = await this.createMaterial({ USE_SHADOW_MAP });

        for (const info of json.materials || []) {
            let textureIdx = -1;
            if (info.pbrMetallicRoughness.baseColorTexture?.index != undefined) {
                textureIdx = json.textures[info.pbrMetallicRoughness.baseColorTexture?.index].source;
            }
            this._materials.push(await this.createMaterial({ USE_SHADOW_MAP, USE_SKIN: json.skins ? 1 : 0 }, { albedo: info.pbrMetallicRoughness.baseColorFactor, texture: textures[textureIdx] }));
        }
        this._textures = textures;

        const child2parent: Record<number, number> = {};
        for (let i = 0; i < json.nodes.length; i++) {
            const node = json.nodes[i];
            if (!node.children) {
                continue;
            }
            for (const child of node.children) {
                child2parent[child] = i;
            }
        }

        function node2path(idx: number) {
            const paths: string[] = [];
            do {
                paths.push(json.nodes[idx].name);
                idx = child2parent[idx];
            } while (idx != undefined);
            return paths.reverse();
        }

        // skin
        for (const skin of json.skins || []) {
            const inverseBindMatrices: Mat4[] = [];
            const accessor = json.accessors[skin.inverseBindMatrices];
            const bufferView = json.bufferViews[accessor.bufferView];
            for (let i = 0; i < accessor.count; i++) {
                inverseBindMatrices[i] = new Float32Array(bin, bufferView.byteOffset + Float32Array.BYTES_PER_ELEMENT * 16 * i, 16) as unknown as Mat4;
            }
            const joints: string[][] = (skin.joints as Array<number>).map(joint => node2path(joint));
            this._skins.push({ inverseBindMatrices, joints });
        }

        // animation
        for (const animation of json.animations || []) {
            const channels: Channel[] = []
            for (const channel of animation.channels) {
                const sampler = animation.samplers[channel.sampler];
                // the input/output pair: 
                // a set of floating-point scalar values representing linear time in seconds; 
                // and a set of vectors or scalars representing the animated property. 
                let accessor = json.accessors[sampler.input];
                let bufferView = json.bufferViews[accessor.bufferView];
                const input = new Float32Array(bin, bufferView.byteOffset, bufferView.byteLength / Float32Array.BYTES_PER_ELEMENT);
                accessor = json.accessors[sampler.output];
                bufferView = json.bufferViews[accessor.bufferView];
                const output = new Float32Array(bin, bufferView.byteOffset, bufferView.byteLength / Float32Array.BYTES_PER_ELEMENT);
                const interpolation = sampler.interpolation;
                channels.push({ node: node2path(channel.target.node), path: channel.target.path, sampler: { input, output, interpolation } })
            }
            this._animations.push(new Animation(animation.name, channels));
        }

        this._bin = bin;
        this._json = json;
        return this;
    }

    createScene(name?: string, materialInstancing = false): Node | null {
        if (!this._json || !this._bin || !this._textures) return null;

        const scene = (this._json.scenes as any[]).find(scene => scene.name == name || name == undefined);
        const node = new Node(name);
        for (const index of scene.nodes) {
            node.addChild(this.createNode(this._json.nodes[index], materialInstancing, node))
        }
        return node;
    }

    private async createMaterial(macros: MaterialMacros, values: MaterialValues = {}) {
        const USE_SHADOW_MAP = macros.USE_SHADOW_MAP == undefined ? 0 : macros.USE_SHADOW_MAP;
        const USE_SKIN = macros.USE_SKIN == undefined ? 0 : macros.USE_SKIN;
        const albedo = values.albedo || vec4.ONE;
        const texture = values.texture;

        const passes: Pass[] = [];

        if (USE_SHADOW_MAP) {
            const shadowMapShader = await ShaderLib.instance.loadShader('shadowmap');
            const shadowMapPass = new Pass(
                new PassState(
                    shadowMapShader,
                    PrimitiveTopology.TRIANGLE_LIST,
                    { cullMode: CullMode.FRONT }
                ),
                PhaseFlag.SHADOWMAP
            );
            shadowMapPass.initialize();
            passes.push(shadowMapPass);
        }

        const phongShader = await ShaderLib.instance.loadShader('phong', {
            USE_ALBEDO_MAP: texture ? 1 : 0,
            USE_SHADOW_MAP,
            SHADOW_MAP_PCF: 1,
            USE_SKIN,
            CLIP_SPACE_MIN_Z_0: gfx.capabilities.clipSpaceMinZ == 0 ? 1 : 0
        })

        const phongPass = new Pass(new PassState(phongShader));
        phongPass.initialize()
        if (texture) {
            phongPass.setTexture('albedoMap', texture.gfx_texture)
        }
        phongPass.setUniform('Material', 'albedo', albedo)
        passes.push(phongPass);

        return new Material(passes);
    }

    private createNode(info: any, materialInstancing: boolean, root?: Node): Node {
        const node = new Node(info.name);
        if (!root) {
            root = node;
        }
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
        }

        if (info.mesh != undefined) {
            const [mesh, materials] = this.createMesh(this._json.meshes[info.mesh], materialInstancing);
            const renderer = node.addComponent(info.skin != undefined ? SkinnedMeshRenderer : MeshRenderer);
            renderer.mesh = mesh
            renderer.materials = materials;
            if (renderer instanceof SkinnedMeshRenderer) {
                renderer.skin = this._skins[info.skin];
                renderer.transform = root;
            }
        }

        if (info.children) {
            for (const idx of info.children) {
                const info = this._json.nodes[idx];
                node.addChild(this.createNode(info, materialInstancing, root));
            }
        }
        return node;
    }

    private createMesh(info: any, materialInstancing: boolean): [Mesh, Material[]] {
        const subMeshes: SubMesh[] = [];
        const materials: Material[] = [];
        for (const primitive of info.primitives) {
            let material = primitive.material == undefined ? this._default_material : this._materials[primitive.material];
            if (materialInstancing) {
                material = new MaterialInstance(material);
            }
            // assert
            if (primitive.material != undefined &&
                this._json.materials[primitive.material].pbrMetallicRoughness.baseColorTexture?.index != undefined &&
                primitive.attributes['TEXCOORD_0'] == undefined) {
                console.log("not provided attribute: TEXCOORD_0")
                continue;
            }

            const vertexBuffers: Buffer[] = [];
            const vertexOffsets: number[] = [];
            const vertexAttributes: VertexAttribute[] = [];
            for (const key in primitive.attributes) {
                const accessor = this._json.accessors[primitive.attributes[key]];
                const format: Format = (Format as any)[`${format_part1[accessor.type]}${format_part2[accessor.componentType]}`];
                if (format == undefined) {
                    console.log(`unknown format of accessor: type ${accessor.type} componentType ${accessor.componentType}`);
                    continue;
                }
                const name = builtinAttributes[key];
                if (!name) {
                    // console.log(`unknown attribute: ${key}`);
                    continue;
                }
                const attribute: VertexAttribute = {
                    name,
                    format,
                    buffer: vertexBuffers.length,
                    offset: 0
                }
                vertexAttributes.push(attribute);
                vertexBuffers.push(this.getBuffer(accessor.bufferView, BufferUsageFlagBits.VERTEX));
                vertexOffsets.push(accessor.byteOffset || 0);
            }

            const indexAccessor = this._json.accessors[primitive.indices];
            const indexBuffer = this.getBuffer(indexAccessor.bufferView, BufferUsageFlagBits.INDEX);

            materials.push(material);

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

            const posAccessor = this._json.accessors[primitive.attributes['POSITION']];
            subMeshes.push({
                vertexAttributes,
                vertexBuffers,
                vertexOffsets,
                vertexPositionMin: posAccessor.min,
                vertexPositionMax: posAccessor.max,
                indexBuffer, indexType, indexCount:
                    indexAccessor.count,
                indexOffset: indexAccessor.byteOffset || 0
            })
        }
        return [{ subMeshes }, materials];
    }

    private getBuffer(index: number, usage: BufferUsageFlagBits): Buffer {
        let buffer = this._buffers[index];
        if (!this._buffers[index]) {
            const viewInfo = this._json.bufferViews[index];
            const view = new DataView(this._bin!, viewInfo.byteOffset, viewInfo.byteLength)
            buffer = gfx.createBuffer();

            if (usage & BufferUsageFlagBits.VERTEX) {
                buffer.initialize({
                    usage: usage | BufferUsageFlagBits.TRANSFER_DST,
                    mem_usage: MemoryUsage.GPU_ONLY,
                    stride: viewInfo.byteStride,
                    size: viewInfo.byteLength
                });
                if (!_commandBuffer) {
                    _commandBuffer = gfx.createCommandBuffer();
                    _commandBuffer.initialize();
                }
                if (!_fence) {
                    _fence = gfx.createFence();
                    _fence.initialize();
                }
                _commandBuffer.begin();
                _commandBuffer.copyBuffer(view, buffer);
                _commandBuffer.end();
                gfx.queue.submit({ commandBuffer: _commandBuffer }, _fence);
                gfx.queue.waitFence(_fence);
            } else {
                buffer.initialize({
                    usage: usage,
                    mem_usage: MemoryUsage.CPU_TO_GPU,
                    stride: viewInfo.byteStride,
                    size: viewInfo.byteLength
                });
                buffer.update(view);
            }

            this._buffers[index] = buffer;
        }

        if ((buffer.info.usage & usage) != usage) {
            throw new Error("");
        }
        return buffer;
    }

    private onProgress(loaded: number, total: number, url: string) {
        console.log(`download: ${url}, progress: ${loaded / total * 100}`)
    }
}