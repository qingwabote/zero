// https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html

import Asset from "../base/Asset.js";
import MeshRenderer from "../components/MeshRenderer.js";
import Buffer, { BufferUsageFlagBits, MemoryUsage } from "../gfx/Buffer.js";
import CommandBuffer from "../gfx/CommandBuffer.js";
import Fence from "../gfx/Fence.js";
import { IndexType } from "../gfx/InputAssembler.js";
import { CullMode, Format, PassState, PrimitiveTopology } from "../gfx/Pipeline.js";
import mat4 from "../math/mat4.js";
import { Quat } from "../math/quat.js";
import { Vec3 } from "../math/vec3.js";
import vec4, { Vec4 } from "../math/vec4.js";
import Node from "../Node.js";
import BufferView from "../render/buffers/BufferView.js";
import Mesh from "../render/Mesh.js";
import Pass from "../render/Pass.js";
import PassPhase from "../render/PassPhase.js";
import samplers from "../render/samplers.js";
import SubMesh, { VertexAttribute } from "../render/SubMesh.js";
import VisibilityBit from "../render/VisibilityBit.js";
import ShaderLib from "../ShaderLib.js";
import Material from "./Material.js";
import Texture from "./Texture.js";

const builtinAttributes: Record<string, string> = {
    "POSITION": "a_position",
    "TEXCOORD_0": "a_texCoord",
    "NORMAL": "a_normal"
}

const formatPart1Names: Record<string, string> = {
    "SCALAR": "R",
    "VEC2": "RG",
    "VEC3": "RGB",
    "VEC4": "RGBA"
}

const formatPart2Names: Record<number, string> = {
    5123: "16UI",
    5125: "32UI",
    5126: "32F"
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

    private _materials!: Material[];

    async load(url: string, USE_SHADOW_MAP = 0): Promise<this> {
        const res = url.match(/(.+)\/(.+)$/);
        if (!res) {
            return this;
        }

        const [, parent, name] = res;
        const json = JSON.parse(await loader.load(`${parent}/${name}.gltf`, "text", this.onProgress));
        this._bin = await loader.load(`${parent}/${uri2path(json.buffers[0].uri)}`, "arraybuffer", this.onProgress);
        const json_images = json.images || [];
        const textures = await Promise.all(json_images.map((info: any) => Asset.cache.load(`${parent}/${uri2path(info.uri)}`, Texture)));

        const materials: Material[] = [];
        for (const info of json.materials) {
            const passes: Pass[] = [];

            if (USE_SHADOW_MAP) {
                const shadowMapShader = await ShaderLib.instance.loadShader('shadowmap');
                const shadowMapPass = new Pass(
                    new PassState(
                        shadowMapShader,
                        PrimitiveTopology.TRIANGLE_LIST,
                        { cullMode: CullMode.FRONT }
                    ),
                    undefined,
                    PassPhase.SHADOWMAP
                );
                passes.push(shadowMapPass);
            }

            const textureIdx: number = info.pbrMetallicRoughness.baseColorTexture?.index;

            const USE_ALBEDO_MAP = textureIdx == undefined ? 0 : 1;

            const phongShader = await ShaderLib.instance.loadShader('phong', {
                USE_ALBEDO_MAP,
                USE_SHADOW_MAP,
                SHADOW_MAP_PCF: 1,
                CLIP_SPACE_MIN_Z_0: gfx.capabilities.clipSpaceMinZ == 0 ? 1 : 0
            })

            const phoneDescriptorSet = gfx.createDescriptorSet();
            phoneDescriptorSet.initialize(ShaderLib.instance.getDescriptorSetLayout(phongShader));
            if (USE_ALBEDO_MAP) {
                phoneDescriptorSet.bindTexture(0, textures[json.textures[textureIdx].source].gfx_texture, samplers.get());
            }
            const ubo_material = new BufferView('Float32', BufferUsageFlagBits.UNIFORM, 4);
            const albedo: Vec4 = info.pbrMetallicRoughness.baseColorFactor || vec4.ONE;
            ubo_material.set(albedo, 0);
            ubo_material.update()
            phoneDescriptorSet.bindBuffer(1, ubo_material.buffer);

            const phongPass = new Pass(new PassState(phongShader), phoneDescriptorSet);
            passes.push(phongPass);

            materials.push(new Material(passes));
        }
        this._materials = materials;

        this._textures = textures;
        this._json = json;
        return this;
    }

    createScene(name: string, visibility = VisibilityBit.DEFAULT): Node | null {
        if (!this._json || !this._bin || !this._textures) return null;

        const scenes: any[] = this._json.scenes;
        const scene = scenes.find(scene => scene.name == name);
        const node = new Node(name);
        node.visibility = visibility;
        for (const index of scene.nodes) {
            node.addChild(this.createNode(this._json.nodes[index], visibility))
        }
        return node;
    }

    private createNode(info: any, visibility: VisibilityBit): Node {
        const node = new Node(info.name);
        node.visibility = visibility;
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
            this.createMesh(node, this._json.meshes[info.mesh]);
        }

        if (info.children) {
            for (const idx of info.children) {
                const info = this._json.nodes[idx];
                node.addChild(this.createNode(info, visibility));
            }
        }
        return node;
    }

    private createMesh(node: Node, info: any) {
        const subMeshes: SubMesh[] = [];
        const materials: Material[] = [];
        for (const primitive of info.primitives) {
            if (primitive.material == undefined) {
                console.log("primitive with no material");
                continue;
            }
            if (this._json.materials[primitive.material].pbrMetallicRoughness.baseColorTexture?.index != undefined) {
                if (primitive.attributes['TEXCOORD_0'] == undefined) {
                    // throw new Error("not provided attribute: TEXCOORD_0");
                    console.log("not provided attribute: TEXCOORD_0")
                    continue;
                }
            }
            const vertexBuffers: Buffer[] = [];
            const vertexOffsets: number[] = [];
            const attributes: VertexAttribute[] = [];
            for (const name in primitive.attributes) {
                const accessor = this._json.accessors[primitive.attributes[name]];
                const format: Format = (Format as any)[`${formatPart1Names[accessor.type]}${formatPart2Names[accessor.componentType]}`];
                // if (format == undefined) {
                //     console.error(`unknown format of accessor: type ${accessor.type} componentType ${accessor.componentType}`)
                // }
                const attribute: VertexAttribute = {
                    name: builtinAttributes[name] || name,
                    format,
                    buffer: vertexBuffers.length,
                    offset: 0
                }
                attributes.push(attribute);
                vertexBuffers.push(this.getBuffer(accessor.bufferView, BufferUsageFlagBits.VERTEX));
                vertexOffsets.push(accessor.byteOffset || 0);
            }

            const accessor = this._json.accessors[primitive.indices];
            const buffer = this.getBuffer(accessor.bufferView, BufferUsageFlagBits.INDEX);

            materials.push(this._materials[primitive.material]);

            if (accessor.type != "SCALAR") {
                throw new Error("unsupported index type");
            }
            let indexType: IndexType;
            switch (accessor.componentType) {
                case 5123:
                    indexType = IndexType.UINT16;
                    break;
                case 5125:
                    indexType = IndexType.UINT32;
                    break;
                default:
                    throw new Error("unsupported index type");
            }
            subMeshes.push(new SubMesh(attributes, vertexBuffers, vertexOffsets, buffer, indexType, accessor.count, accessor.byteOffset || 0))
        }

        const renderer = node.addComponent(MeshRenderer);
        renderer.mesh = new Mesh(subMeshes);
        renderer.materials = materials;
    }

    private getBuffer(index: number, usage: BufferUsageFlagBits): Buffer {
        let buffer = this._buffers[index];
        if (!this._buffers[index]) {
            const viewInfo = this._json.bufferViews[index];
            // if (usage & BufferUsageBit.VERTEX) {
            //     console.assert(viewInfo.target == 34962)
            // } else {
            //     console.assert(viewInfo.target == 34963)
            // }
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