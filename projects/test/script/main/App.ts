import GLTF from "../../../../script/core/assets/GLTF.js";
import Camera from "../../../../script/core/components/Camera.js";
import DirectionalLight from "../../../../script/core/components/DirectionalLight.js";
import DebugDrawer from "../../../../script/core/components/physics/DebugDrawer.js";
import Profiler from "../../../../script/core/components/Profiler.js";
import Sprite from "../../../../script/core/components/Sprite.js";
import { ClearFlagBit, SampleCountFlagBits } from "../../../../script/core/gfx/Pipeline.js";
import vec3, { Vec3 } from "../../../../script/core/math/vec3.js";
import Node from "../../../../script/core/Node.js";
import ModelPhase from "../../../../script/core/pipeline/phases/ModelPhase.js";
import RenderFlow from "../../../../script/core/pipeline/RenderFlow.js";
import RenderStage from "../../../../script/core/pipeline/RenderStage.js";
import ForwardStage from "../../../../script/core/pipeline/stages/ForwardStage.js";
import ShadowStage from "../../../../script/core/pipeline/stages/ShadowStage.js";
import PassPhase from "../../../../script/core/render/PassPhase.js";
import VisibilityBit from "../../../../script/core/render/VisibilityBit.js";
import Zero from "../../../../script/core/Zero.js";
import CameraModePanel from "./CameraModePanel.js";

const PhaseLightView = 1 << 10;

const Visibility_Up = 1 << 9;
const Visibility_Down = 1 << 10;

const USE_SHADOW_MAP = 1;

export default class App extends Zero {
    async start(): Promise<RenderFlow> {
        const { width, height } = this.window;

        const stages: RenderStage[] = [];
        let shadowStage: ShadowStage;
        if (USE_SHADOW_MAP) {
            shadowStage = new ShadowStage;
            stages.push(shadowStage);
        }

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
        cameraUp.viewport = { x: 0, y: 0, width, height };
        node.position = [0, 0, 10];

        // UI
        node = new Node;
        const cameraUI = node.addComponent(Camera);
        cameraUI.visibilities = VisibilityBit.UI;
        cameraUI.clearFlags = ClearFlagBit.DEPTH;
        cameraUI.orthoHeight = height / 2;
        cameraUI.viewport = { x: 0, y: 0, width, height };
        node.position = vec3.create(0, 0, width / 2);

        node = new Node;
        node.visibility = VisibilityBit.UI;
        node.addComponent(DebugDrawer);

        node = new Node;
        node.visibility = VisibilityBit.UI;
        node.addComponent(Profiler);
        node.position = [-width / 2, - height / 2 + 200, 0];

        node = new Node;
        node.visibility = VisibilityBit.UI;
        node.addComponent(CameraModePanel).camera = cameraUp;
        node.position = [-width / 2, height / 2, 0];

        if (USE_SHADOW_MAP) {
            node = new Node;
            node.visibility = VisibilityBit.UI;
            node.position = [width / 2 - 200, -height / 2 + 200, 0];
            const sprite = node.addComponent(Sprite);
            sprite.width = 200;
            sprite.height = 200;
            sprite.texture = shadowStage!.framebuffer.info.depthStencilAttachment;
        }

        // const zeroShader = await shaders.getShader('zero', { USE_ALBEDO_MAP });
        // const zeroDescriptorSet = gfx.createDescriptorSet();
        // zeroDescriptorSet.initialize(shaders.getDescriptorSetLayout(zeroShader));
        // if (USE_ALBEDO_MAP) {
        //     zeroDescriptorSet.bindTexture(0, gltf.textures[gltf.json.textures[textureIdx].source].gfx_texture, defaults.sampler);
        // }
        // const zeroPass = new Pass(
        //     zeroDescriptorSet,
        //     zeroShader,
        //     { cullMode: CullMode.FRONT },
        //     undefined,
        //     PhaseLightView
        // );

        // const guardian = new GLTF();
        // await guardian.load('./asset/guardian_zelda_botw_fan-art/scene', 1);
        // node = guardian.createScene("Sketchfab_Scene")!;

        // const plane = new GLTF();
        // await plane.load('./asset/plane', 1);
        // node = plane.createScene("Scene")!;
        // node.scale = [4, 4, 4];

        const gltf_camera = new GLTF();
        await gltf_camera.load('./asset/camera_from_poly_by_google/scene');
        node = gltf_camera.createScene("Sketchfab_Scene")!;
        node.scale = [0.01, 0.01, 0.01];

        stages.push(new ForwardStage([new ModelPhase(PassPhase.DEFAULT, VisibilityBit.UI | Visibility_Up)]));
        return new RenderFlow(stages, SampleCountFlagBits.SAMPLE_COUNT_1);
    }
}

