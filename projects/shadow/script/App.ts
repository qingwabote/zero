import { Animation, Camera, CameraControlPanel, DirectionalLight, Effect, GLTF, Material, MaterialMacros, MaterialValues, ModelPhase, Node, Profiler, ShaderStages, ShadowUniform, SpriteFrame, SpriteRenderer, UIDocument, UIRenderer, Vec3, VisibilityFlagBits, Zero, assetLib, device, getSampler, quat, render, shaderLib, stageFactory, vec2, vec3, vec4 } from 'engine';

const VisibilityBit_UP = 1 << 9;
const VisibilityBit_DOWN = 1 << 10;

const USE_SHADOW_MAP = 1;

async function materialFunc(macros: MaterialMacros = {}, values: MaterialValues = {}) {
    const USE_SKIN = macros.USE_SKIN == undefined ? 0 : macros.USE_SKIN;
    const albedo = values.albedo || vec4.ONE;
    const texture = values.texture;

    const effect = await assetLib.cache("./assets/effects/test", Effect);
    const passes = await effect.createPasses([
        {
            macros: { USE_SHADOW_MAP }
        },
        {
            macros: {
                USE_ALBEDO_MAP: texture ? 1 : 0,
                USE_SHADOW_MAP,
                USE_SKIN,
                CLIP_SPACE_MIN_Z_0: device.capabilities.clipSpaceMinZ == 0 ? 1 : 0
            },
            constants: {
                albedo
            },
            ...texture && { samplerTextures: { albedoMap: [texture.impl, getSampler()] } }
        },
        {
            macros: {
                USE_ALBEDO_MAP: texture ? 1 : 0
            },
            constants: {
                albedo
            },
            ...texture && { samplerTextures: { albedoMap: [texture.impl, getSampler()] } }
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

const ss_depth = new ShaderStages();
await ss_depth.load('depth');

export class App extends Zero {
    protected override start(): render.Flow {
        const { width, height } = device.swapchain;

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
        ui_camera.clearFlags = 0x2 // ClearFlagBits.DEPTH;
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
        const animation = node.addComponent(Animation);
        animation.clips = guardian.animationClips;
        animation.play('WalkCycle')

        node.visibilityFlag = VisibilityFlagBits.DEFAULT

        node = plane.createScene("Plane")!;
        node.visibilityFlag = VisibilityFlagBits.DEFAULT
        node.scale = [5, 1, 5];

        node = gltf_camera.createScene("Sketchfab_Scene")!;
        node.visibilityFlag = VisibilityBit_DOWN
        node.scale = [0.005, 0.005, 0.005];
        node.euler = vec3.create(180, 0, 180)
        up_camera.node.addChild(node);

        const stages: render.Stage[] = [];
        if (USE_SHADOW_MAP) {
            const stage = stageFactory.shadow(VisibilityBit_UP);

            const sprite = UIRenderer.create(SpriteRenderer);
            sprite.impl.spriteFrame = new SpriteFrame(stage.framebuffer.info.depthStencilAttachment);
            sprite.impl.shader = shaderLib.getShader(ss_depth);
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
        return new render.Flow(stages);
    }
}
