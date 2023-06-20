import VisibilityFlagBits from "../../../../script/main/VisibilityFlagBits.js";
import Effect from "../../../../script/main/assets/Effect.js";
import GLTF, { MaterialMacros, MaterialValues } from "../../../../script/main/assets/GLTF.js";
import Material from "../../../../script/main/assets/Material.js";
import SpriteFrame from "../../../../script/main/assets/SpriteFrame.js";
import Camera from "../../../../script/main/components/Camera.js";
import DirectionalLight from "../../../../script/main/components/DirectionalLight.js";
import SpriteRenderer from "../../../../script/main/components/SpriteRenderer.js";
import CameraControlPanel from "../../../../script/main/components/ui/CameraControlPanel.js";
import Profiler from "../../../../script/main/components/ui/Profiler.js";
import UIDocument from "../../../../script/main/components/ui/UIDocument.js";
import UIRenderer from "../../../../script/main/components/ui/UIRenderer.js";
import Node from "../../../../script/main/core/Node.js";
import Zero from "../../../../script/main/core/Zero.js";
import assetLib from "../../../../script/main/core/assetLib.js";
import { ClearFlagBits } from "../../../../script/main/core/gfx/Pipeline.js";
import quat from "../../../../script/main/core/math/quat.js";
import vec2 from "../../../../script/main/core/math/vec2.js";
import vec3, { Vec3 } from "../../../../script/main/core/math/vec3.js";
import vec4 from "../../../../script/main/core/math/vec4.js";
import Flow from "../../../../script/main/core/pipeline/Flow.js";
import Stage from "../../../../script/main/core/pipeline/Stage.js";
import samplers from "../../../../script/main/core/samplers.js";
import shaderLib from "../../../../script/main/core/shaderLib.js";
import ModelPhase from "../../../../script/main/pipeline/phases/ModelPhase.js";
import stageFactory from "../../../../script/main/pipeline/stageFactory.js";
import ShadowUniform from "../../../../script/main/pipeline/uniforms/ShadowUniform.js";

// const loader2: Loader = (globalThis as any).loader2;
// const text = await loader2.load("../../assets/fnt/zero_0.png", "bitmap");
// console.log("text", text.height);

const VisibilityBit_UP = 1 << 9;
const VisibilityBit_DOWN = 1 << 10;

const USE_SHADOW_MAP = 1;

async function materialFunc(macros: MaterialMacros = {}, values: MaterialValues = {}) {
    const USE_SKIN = macros.USE_SKIN == undefined ? 0 : macros.USE_SKIN;
    const albedo = values.albedo || vec4.ONE;
    const texture = values.texture;

    const effect = await assetLib.load("./assets/effects/test", Effect);
    const passes = await effect.createPasses([
        {
            macros: { USE_SHADOW_MAP }
        },
        {
            macros: {
                USE_ALBEDO_MAP: texture ? 1 : 0,
                USE_SHADOW_MAP,
                USE_SKIN,
                CLIP_SPACE_MIN_Z_0: gfx.capabilities.clipSpaceMinZ == 0 ? 1 : 0
            },
            constants: {
                albedo
            },
            ...texture && { samplerTextures: { albedoMap: [texture.impl, samplers.get()] } }
        },
        {
            macros: {
                USE_ALBEDO_MAP: texture ? 1 : 0
            },
            constants: {
                albedo
            },
            ...texture && { samplerTextures: { albedoMap: [texture.impl, samplers.get()] } }
        }
    ])
    return new Material(passes);
}

const guardian = new GLTF();
guardian.materialFunc = materialFunc;
await guardian.load('./assets/guardian_zelda_botw_fan-art/scene');

const plane = new GLTF();
plane.materialFunc = materialFunc;
await plane.load('../../assets/models/primitive/scene');

const gltf_camera = new GLTF();
gltf_camera.materialFunc = materialFunc;
await gltf_camera.load('./assets/camera_from_poly_by_google/scene');

const shader_depth = await shaderLib.load('depth');

export default class App extends Zero {
    start(): Flow {
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

        const down_size = Math.min(height / 2, width);
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
        const ui_camera = node.addComponent(Camera);
        ui_camera.visibilityFlags = VisibilityFlagBits.UI;
        ui_camera.clearFlags = ClearFlagBits.DEPTH;
        ui_camera.orthoHeight = height / 2;
        ui_camera.viewport = { x: 0, y: 0, width, height };
        node.position = vec3.create(0, 0, width / 2);

        const doc = (new Node).addComponent(UIDocument);

        node = new Node;
        node.visibilityFlag = VisibilityFlagBits.UI;
        const profiler = node.addComponent(Profiler);
        profiler.anchor = vec2.create(0, 0)
        node.position = [-width / 2, - height / 2, 0];

        node = new Node;
        node.visibilityFlag = VisibilityFlagBits.UI;
        const cameraControlPanel = node.addComponent(CameraControlPanel);
        cameraControlPanel.size = vec2.create(width, height);
        cameraControlPanel.camera = up_camera;
        doc.addElement(cameraControlPanel);


        node = guardian.createScene("Sketchfab_Scene")!;
        node.visibilityFlag = VisibilityFlagBits.DEFAULT

        node = plane.createScene("Plane")!;
        node.visibilityFlag = VisibilityFlagBits.DEFAULT
        node.scale = [5, 1, 5];

        node = gltf_camera.createScene("Sketchfab_Scene")!;
        node.visibilityFlag = VisibilityBit_DOWN
        node.scale = [0.005, 0.005, 0.005];
        node.euler = vec3.create(180, 0, 180)
        up_camera.node.addChild(node);

        const stages: Stage[] = [];
        if (USE_SHADOW_MAP) {
            const stage = stageFactory.shadow(VisibilityBit_UP);

            const sprite = UIRenderer.create(SpriteRenderer);
            sprite.impl.spriteFrame = new SpriteFrame(stage.framebuffer.info.depthStencilAttachment);
            sprite.impl.shader = shader_depth;
            sprite.size = [height / 4, height / 4]
            sprite.anchor = [1, 0];
            sprite.node.position = [width / 2, -height / 2, 0];
            sprite.node.visibilityFlag = VisibilityFlagBits.UI;

            stages.push(stage);
        }
        stages.push(stageFactory.forward([
            new ModelPhase('default', VisibilityFlagBits.UI | VisibilityBit_UP),
            new ModelPhase('down', VisibilityBit_DOWN)
        ]));
        return new Flow(stages);
    }
}

