import FNT from "../../../../script/core/assets/FNT.js";
import GLTF from "../../../../script/core/assets/GLTF.js";
import Camera from "../../../../script/core/components/Camera.js";
import DirectionalLight from "../../../../script/core/components/DirectionalLight.js";
import FPS from "../../../../script/core/components/FPS.js";
import Label from "../../../../script/core/components/Label.js";
import defaults from "../../../../script/core/defaults.js";
import { ClearFlagBit, CullMode, SampleCountFlagBits } from "../../../../script/core/gfx/Pipeline.js";
import vec3, { Vec3 } from "../../../../script/core/math/vec3.js";
import Node from "../../../../script/core/Node.js";
import ForwardPhase from "../../../../script/core/pipeline/phases/ForwardPhase.js";
import ShadowmapPhase from "../../../../script/core/pipeline/phases/ShadowmapPhase.js";
import RenderFlow from "../../../../script/core/pipeline/RenderFlow.js";
import Material from "../../../../script/core/render/Material.js";
import Pass from "../../../../script/core/render/Pass.js";
import PassPhase from "../../../../script/core/render/PassPhase.js";
import VisibilityBit from "../../../../script/core/render/VisibilityBit.js";
import shaders from "../../../../script/core/shaders.js";
import Zero from "../../../../script/core/Zero.js";
import ZeroComponent from "./ZeroComponent.js";

const PhaseLightView = 1 << 10;

const Visibility_Up = 1 << 9;
const Visibility_Down = 1 << 10;

export default class App extends Zero {
    start(): RenderFlow {
        const { width, height } = this.window;

        const lit_position: Vec3 = [4, 4, 4];

        let node: Node;

        // light
        node = new Node;
        node.addComponent(DirectionalLight);
        node.position = lit_position;
        node.visibility = Visibility_Up;

        // node = new Node;
        // const lit_camera = node.addComponent(Camera);
        // lit_camera.visibilities = VisibilityBit.DEFAULT | Visibility_Down;
        // lit_camera.orthoHeight = 4;
        // lit_camera.far = 10
        // lit_camera.viewport = { x: 0, y: 0, width, height: height * 0.5 };
        // node.position = lit_position;
        // node.rotation = quat.rotationTo(quat.create(), vec3.create(0, 0, -1), vec3.normalize(vec3.create(), vec3.negate(vec3.create(), lit_position)));

        node = new Node;
        const cameraUp = node.addComponent(Camera);
        cameraUp.visibilities = VisibilityBit.DEFAULT | Visibility_Up;
        cameraUp.fov = 45;
        cameraUp.viewport = { x: 0, y: height * 0.5, width, height: height * 0.5 };
        node.addComponent(ZeroComponent);
        node.position = [0, 0.5, 4];

        // UI
        node = new Node;
        const cameraUI = node.addComponent(Camera);
        cameraUI.visibilities = VisibilityBit.UI;
        cameraUI.clearFlags = ClearFlagBit.DEPTH;
        cameraUI.orthoHeight = height / 2;
        cameraUI.viewport = { x: 0, y: 0, width, height };
        node.position = [0, 0, 1];
        (async () => {
            const zero = await shaders.getShader('zero', { USE_ALBEDO_MAP: 1 });
            const fnt = new FNT;
            await fnt.load('./asset/zero');
            node = new Node;
            const label = node.addComponent(Label);
            label.fnt = fnt;
            label.shader = zero;
            node.addComponent(FPS);
            node.position = [-width / 2, height / 2, 0];
            node.visibility = VisibilityBit.UI;

            // if (shadowmapPhase) {
            //     const shader = await shaders.getShader('depth');
            //     node = new Node;
            //     node.position = [width / 2 - 200, -height / 2 + 200, 0];
            //     node.visibility = VisibilityBit.UI;
            //     const sprite = node.addComponent(Sprite);
            //     sprite.shader = shader;
            //     sprite.width = 200;
            //     sprite.height = 200;
            //     sprite.texture = shadowmapPhase.depthStencilAttachment;
            // }
        })();

        (async () => {
            async function createMaterials(gltf: GLTF): Promise<Material[]> {
                const materials: Material[] = [];
                for (const info of gltf.json.materials) {
                    const textureIdx: number = info.pbrMetallicRoughness.baseColorTexture?.index;
                    const shadowmapShader = await shaders.getShader('shadowmap');
                    const shadowmapDescriptorSet = gfx.createDescriptorSet();
                    shadowmapDescriptorSet.initialize(shaders.getDescriptorSetLayout(shadowmapShader));
                    const shadowmapPass = new Pass(
                        shadowmapDescriptorSet,
                        shadowmapShader,
                        { cullMode: CullMode.FRONT },
                        undefined,
                        PassPhase.SHADOWMAP
                    );

                    const USE_ALBEDO_MAP = textureIdx == undefined ? 0 : 1;

                    const phongShader = await shaders.getShader('phong', {
                        USE_ALBEDO_MAP,
                        USE_SHADOW_MAP: 1,
                        SHADOW_MAP_PCF: 1,
                        CLIP_SPACE_MIN_Z_0: gfx.capabilities.clipSpaceMinZ == 0 ? 1 : 0
                    })
                    // const phongShader = await shaders.getShader('zero', { USE_ALBEDO_MAP });

                    const phoneDescriptorSet = gfx.createDescriptorSet();
                    phoneDescriptorSet.initialize(shaders.getDescriptorSetLayout(phongShader));
                    if (USE_ALBEDO_MAP) {
                        phoneDescriptorSet.bindTexture(0, gltf.textures[gltf.json.textures[textureIdx].source].gfx_texture, defaults.sampler);
                    }
                    const phongPass = new Pass(phoneDescriptorSet, phongShader);

                    const zeroShader = await shaders.getShader('zero', { USE_ALBEDO_MAP });
                    const zeroDescriptorSet = gfx.createDescriptorSet();
                    zeroDescriptorSet.initialize(shaders.getDescriptorSetLayout(zeroShader));
                    if (USE_ALBEDO_MAP) {
                        zeroDescriptorSet.bindTexture(0, gltf.textures[gltf.json.textures[textureIdx].source].gfx_texture, defaults.sampler);
                    }
                    const zeroPass = new Pass(
                        zeroDescriptorSet,
                        zeroShader,
                        { cullMode: CullMode.FRONT },
                        undefined,
                        PhaseLightView
                    );
                    materials.push(new Material([shadowmapPass, phongPass, zeroPass]));
                }
                return materials;
            }

            let node: Node;
            const guardian = new GLTF();
            await guardian.load('./asset/guardian_zelda_botw_fan-art/scene');
            let materials: Material[] = await createMaterials(guardian);
            node = guardian.createScene("Sketchfab_Scene", materials)!;
            const scale = Object.assign(vec3.create(), node.scale);
            scale[0] *= 0.5;
            scale[1] *= 0.5;
            scale[2] *= 0.5;
            node.scale = scale;

            // const guardian = new GLTF();
            // await guardian.load('./asset/untitled');
            // let materials: Material[] = await createMaterials(guardian);
            // node = guardian.createScene("Scene", materials)!;
            // node.addComponent(ZeroComponent);

            const plane = new GLTF();
            await plane.load('./asset/plane');
            materials = await createMaterials(plane);
            node = plane.createScene("Scene", materials)!;
            node.scale = [4, 4, 4];
        })();

        return new RenderFlow(
            [new ShadowmapPhase(), new ForwardPhase(PassPhase.DEFAULT, VisibilityBit.UI | Visibility_Up)],
            SampleCountFlagBits.SAMPLE_COUNT_4);
    }
}

