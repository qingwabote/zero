import GLTF from "../../../../script/main/assets/GLTF.js";
import AnimationController from "../../../../script/main/components/AnimationController.js";
import Camera from "../../../../script/main/components/Camera.js";
import CameraControlPanel from "../../../../script/main/components/CameraControlPanel.js";
import DirectionalLight from "../../../../script/main/components/DirectionalLight.js";
import Profiler from "../../../../script/main/components/Profiler.js";
import UIDocument from "../../../../script/main/components/ui/UIDocument.js";
import { ClearFlagBits } from "../../../../script/main/core/gfx/Pipeline.js";
import quat from "../../../../script/main/core/math/quat.js";
import vec2 from "../../../../script/main/core/math/vec2.js";
import vec3, { Vec3 } from "../../../../script/main/core/math/vec3.js";
import vec4, { Vec4 } from "../../../../script/main/core/math/vec4.js";
import Node from "../../../../script/main/core/Node.js";
import Flow from "../../../../script/main/core/render/Flow.js";
import Stage from "../../../../script/main/core/render/Stage.js";
import Pass from "../../../../script/main/core/scene/Pass.js";
import ShaderLib from "../../../../script/main/core/ShaderLib.js";
import Zero from "../../../../script/main/core/Zero.js";
import PassType from "../../../../script/main/render/PassType.js";
import ModelPhase from "../../../../script/main/render/phases/ModelPhase.js";
import stageFactory from "../../../../script/main/render/stageFactory.js";
import ShadowUniform from "../../../../script/main/render/uniforms/ShadowUniform.js";
import VisibilityFlagBits from "../../../../script/main/VisibilityFlagBits.js";

const PassFlag_DOWN: number = 3;

const VisibilityBit_UP = 1 << 9;
const VisibilityBit_DOWN = 1 << 10;

const USE_SHADOW_MAP = 1;

export default class App extends Zero {
    async start(): Promise<Flow> {
        const { width, height } = this.window;

        const lit_position: Vec3 = [4, 4, 4];

        let node: Node;

        // light
        node = new Node;
        node.addComponent(DirectionalLight);
        node.position = lit_position;
        // node.visibility = Visibility_Up;


        // cameras
        node = new Node;
        const up_camera = node.addComponent(Camera);
        up_camera.visibilityFlags = VisibilityFlagBits.DEFAULT | VisibilityBit_UP;
        up_camera.fov = 45;
        up_camera.viewport = { x: 0, y: height / 2, width, height: height / 2 };
        node.position = [0, 0, 10];

        const down_size = 400;
        node = new Node;
        const down_camera = node.addComponent(Camera);
        down_camera.visibilityFlags = VisibilityFlagBits.DEFAULT | VisibilityBit_DOWN;
        down_camera.orthoHeight = ShadowUniform.camera.orthoHeight;
        down_camera.far = ShadowUniform.camera.far;
        down_camera.viewport = { x: 0, y: 0, width: down_size * ShadowUniform.camera.aspect, height: down_size };
        node.position = lit_position;
        node.rotation = quat.rotationTo(quat.create(), vec3.create(0, 0, -1), vec3.normalize(vec3.create(), vec3.negate(vec3.create(), lit_position)));

        // UI
        node = new Node;
        const cameraUI = node.addComponent(Camera);
        cameraUI.visibilityFlags = VisibilityFlagBits.UI;
        cameraUI.clearFlags = ClearFlagBits.DEPTH;
        cameraUI.orthoHeight = height / 2;
        cameraUI.viewport = { x: 0, y: 0, width, height };
        node.position = vec3.create(0, 0, width / 2);

        const doc = (new Node).addComponent(UIDocument);

        node = new Node;
        node.visibilityFlag = VisibilityFlagBits.UI;
        node.addComponent(Profiler);
        node.position = [-width / 2, - height / 2, 0];

        node = new Node;
        node.visibilityFlag = VisibilityFlagBits.UI;
        const cameraControlPanel = node.addComponent(CameraControlPanel);
        cameraControlPanel.size = vec2.create(width, height);
        cameraControlPanel.camera = up_camera;
        doc.addElement(cameraControlPanel);

        async function addUnlitPass(gltf: GLTF) {
            for (let i = 0; i < gltf.materials.length; i++) {
                const material = gltf.materials[i];

                const info = gltf.json.materials[i];
                let textureIdx = -1;
                if (info.pbrMetallicRoughness.baseColorTexture?.index != undefined) {
                    textureIdx = gltf.json.textures[info.pbrMetallicRoughness.baseColorTexture?.index].source;
                }
                const albedo: Readonly<Vec4> = info.pbrMetallicRoughness.baseColorFactor || vec4.ONE;

                const unlit_shader = await ShaderLib.instance.loadShader('unlit', { USE_ALBEDO_MAP: textureIdx != -1 ? 1 : 0 });
                const unlit_pass = new Pass({ shader: unlit_shader, depthStencilState: { depthTestEnable: true } }, PassFlag_DOWN);
                if (textureIdx != -1) {
                    unlit_pass.setTexture('albedoMap', gltf.textures[textureIdx].impl)
                }
                unlit_pass.setUniform('Constants', 'albedo', albedo)

                material.passes.push(unlit_pass);
            }
        }

        const guardian = new GLTF();
        await guardian.load('./assets/guardian_zelda_botw_fan-art/scene', USE_SHADOW_MAP);
        await addUnlitPass(guardian)
        node = guardian.createScene("Sketchfab_Scene")!;
        const ac = node.addComponent(AnimationController);
        ac.animations = guardian.animations
        node.visibilityFlag = VisibilityFlagBits.DEFAULT

        const plane = new GLTF();
        await plane.load('./assets/plane', USE_SHADOW_MAP);
        await addUnlitPass(plane)
        node = plane.createScene("Scene")!;
        node.visibilityFlag = VisibilityFlagBits.DEFAULT
        node.scale = [5, 5, 5];

        const gltf_camera = new GLTF();
        await gltf_camera.load('./assets/camera_from_poly_by_google/scene');
        await addUnlitPass(gltf_camera)
        node = gltf_camera.createScene("Sketchfab_Scene")!;
        node.visibilityFlag = VisibilityBit_DOWN
        node.scale = [0.005, 0.005, 0.005];
        node.euler = vec3.create(180, 0, 180)
        up_camera.node.addChild(node);

        const stages: Stage[] = [];
        if (USE_SHADOW_MAP) {
            stages.push(stageFactory.shadow(VisibilityBit_UP));
        }
        stages.push(stageFactory.forward([
            new ModelPhase(PassType.DEFAULT, VisibilityFlagBits.UI | VisibilityBit_UP),
            new ModelPhase(PassFlag_DOWN, VisibilityBit_DOWN)
        ]));
        return new Flow(stages);
    }
}

