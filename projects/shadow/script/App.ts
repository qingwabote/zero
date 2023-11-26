import { bundle } from 'bundling';
import { Animation, Camera, CameraControlPanel, DirectionalLight, Effect, GLTF, Material, MaterialMacros, MaterialValues, ModelPhase, Node, Profiler, ShaderStages, ShadowUniform, SpriteFrame, SpriteRenderer, TextRenderer, UIDocument, UIRenderer, UITouchEventType, Vec3, VisibilityFlagBits, Zero, bundle as builtin, device, getSampler, platform, quat, reboot, render, safeArea, shaderLib, stageFactory, vec2, vec3, vec4 } from 'engine';

const VisibilityBit_UP = 1 << 9;
const VisibilityBit_DOWN = 1 << 10;

const USE_SHADOW_MAP = 1;

class TextGLTF extends GLTF {
    protected override async createMaterial(macros: MaterialMacros = {}, values: MaterialValues = {}): Promise<Material> {
        const USE_SKIN = macros.USE_SKIN == undefined ? 0 : macros.USE_SKIN;
        const albedo = values.albedo || vec4.ONE;
        const texture = values.texture;

        const effect = await bundle.cache("./effects/test", Effect);
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
}

const [guardian, plane, gltf_camera, ss_depth] = await Promise.all([
    bundle.cache('guardian_zelda_botw_fan-art/scene', TextGLTF),
    builtin.cache('models/primitive/scene', TextGLTF),
    bundle.cache('camera_from_poly_by_google/scene', TextGLTF),
    builtin.cache('shaders/depth', ShaderStages)
])


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
        doc.node.visibilityFlag = VisibilityFlagBits.UI;

        node = new Node;
        const profiler = node.addComponent(Profiler);
        profiler.anchor = vec2.create(0, 0)
        node.position = [-width / 2, safeArea.y, 0];
        doc.addElement(profiler);

        const stages: render.Stage[] = [];
        if (USE_SHADOW_MAP) {
            const stage = stageFactory.shadow(VisibilityBit_UP);

            const sprite = UIRenderer.create(SpriteRenderer);
            sprite.impl.spriteFrame = new SpriteFrame(stage.framebuffer.info.depthStencilAttachment);
            sprite.impl.shader = shaderLib.getShader(ss_depth);
            sprite.size = [height / 4, height / 4]
            sprite.anchor = [1, 0.5];
            sprite.node.position = [width / 2, 0, 0];
            doc.addElement(sprite);

            stages.push(stage);
        }

        node = new Node;
        const cameraControlPanel = node.addComponent(CameraControlPanel);
        cameraControlPanel.camera = up_camera;
        cameraControlPanel.size = vec2.create(safeArea.width, safeArea.height);
        cameraControlPanel.anchor = [0, 0];
        cameraControlPanel.node.position = [safeArea.x, safeArea.y, 0];
        doc.addElement(cameraControlPanel);

        if (platform == 'wx') {
            const textRenderer = UIRenderer.create(TextRenderer);
            textRenderer.anchor = vec2.create(0, 1);
            textRenderer.impl.text = 'Reboot';
            textRenderer.impl.color = [0, 1, 0, 1];
            textRenderer.on(UITouchEventType.TOUCH_START, async event => {
                reboot();
            })
            textRenderer.node.position = [-width / 2, safeArea.y + safeArea.height, 0];
            doc.addElement(textRenderer);
        }


        node = guardian.createScene("Sketchfab_Scene")!;
        const animation = node.addComponent(Animation);
        animation.clips = guardian.animationClips;
        animation.play('WalkCycle')
        node.visibilityFlag = VisibilityFlagBits.DEFAULT;
        node.position = [0, -1, 0]

        node = plane.createScene("Plane")!;
        node.visibilityFlag = VisibilityFlagBits.DEFAULT
        node.scale = [5, 1, 5];
        node.position = [0, -1, 0]

        node = gltf_camera.createScene("Sketchfab_Scene")!;
        node.visibilityFlag = VisibilityBit_DOWN
        node.scale = [0.005, 0.005, 0.005];
        node.euler = vec3.create(180, 0, 180)
        up_camera.node.addChild(node);

        stages.push(stageFactory.forward([
            new ModelPhase('default', VisibilityFlagBits.UI | VisibilityBit_UP),
            new ModelPhase('down', VisibilityBit_DOWN)
        ]));
        return new render.Flow(stages);
    }
}

