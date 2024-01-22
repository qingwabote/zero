import { bundle } from 'bundling';
import { Animation, Camera, DirectionalLight, Effect, GLTF, Material, MaterialParams, Node, Pipeline, Shader, ShadowUniform, SpriteFrame, SpriteRenderer, Vec3, Zero, bundle as builtin, device, quat, render, shaderLib, vec3 } from 'engine';
import { CameraControlPanel, Document, Edge, PositionType, Profiler, Renderer } from 'flex';

const VisibilityFlagBits = {
    UP: 1 << 1,
    DOWN: 1 << 2,
    UI: 1 << 29,
    DEFAULT: 1 << 30
} as const

const USE_SHADOW_MAP = 1;

async function materialFunc(params: MaterialParams) {
    const effect = await bundle.cache("./effects/test", Effect);
    const passes = await effect.createPasses([
        {
            macros: { USE_SHADOW_MAP }
        },
        {
            macros: {
                USE_ALBEDO_MAP: params.texture ? 1 : 0,
                USE_SHADOW_MAP,
                USE_SKIN: params.skin ? 1 : 0
            },
            props: {
                albedo: params.albedo
            }
        },
        {
            macros: {
                USE_ALBEDO_MAP: params.texture ? 1 : 0,
            },
            props: {
                albedo: params.albedo
            },
        }
    ])
    if (params.texture) {
        passes[1].setTexture('albedoMap', params.texture.impl)
        passes[2].setTexture('albedoMap', params.texture.impl)
    }
    return new Material(passes);
}

const [guardian, plane, gltf_camera, ss_depth, pipeline] = await Promise.all([
    (async function () {
        const gltf = await bundle.cache('guardian_zelda_botw_fan-art/scene', GLTF);
        return gltf.instantiate(materialFunc);
    })(),
    (async function () {
        const gltf = await builtin.cache('models/primitive/scene', GLTF);
        return gltf.instantiate(materialFunc);
    })(),
    (async function () {
        const gltf = await bundle.cache('camera_from_poly_by_google/scene', GLTF);
        return gltf.instantiate(materialFunc);
    })(),
    builtin.cache('shaders/depth', Shader),
    bundle.cache('pipelines/test', Pipeline)
])

const renderPipeline = await pipeline.createRenderPipeline(VisibilityFlagBits);

export class App extends Zero {
    protected override start(): render.Pipeline {
        const width = 640;
        const height = 960;

        const swapchain = device.swapchain;
        const scaleX = swapchain.width / width;
        const scaleY = swapchain.height / height;
        const scale = scaleX < scaleY ? scaleX : scaleY;

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
        up_camera.visibilities = VisibilityFlagBits.DEFAULT | VisibilityFlagBits.UP;
        up_camera.fov = 45;
        up_camera.viewport = { x: 0, y: swapchain.height / 2, width: swapchain.width, height: swapchain.height / 2 };
        node.position = [0, 0, 10];

        const down_size = Math.min(swapchain.height / 2, swapchain.width);
        node = new Node;
        const down_camera = node.addComponent(Camera);
        down_camera.visibilities = VisibilityFlagBits.DEFAULT | VisibilityFlagBits.DOWN;
        down_camera.orthoHeight = ShadowUniform.camera.orthoHeight;
        down_camera.far = ShadowUniform.camera.far;
        down_camera.viewport = { x: 0, y: 0, width: down_size * ShadowUniform.camera.aspect, height: down_size };
        node.position = lit_position;
        node.rotation = quat.rotationTo(quat.create(), vec3.create(0, 0, -1), vec3.normalize(vec3.create(), vec3.negate(vec3.create(), lit_position)));

        // UI
        node = new Node;
        const ui_camera = node.addComponent(Camera);
        ui_camera.visibilities = VisibilityFlagBits.UI;
        ui_camera.clears = Camera.ClearFlagBits.DEPTH;
        ui_camera.orthoHeight = swapchain.height / scale / 2;
        ui_camera.viewport = { x: 0, y: 0, width: swapchain.width, height: swapchain.height };
        node.position = vec3.create(0, 0, width / 2);

        node = new Node;
        node.position = vec3.create(-width / 2, height / 2);
        node.visibility = VisibilityFlagBits.UI;
        const doc = node.addComponent(Document);

        const sprite = Renderer.create(SpriteRenderer);
        sprite.impl.spriteFrame = new SpriteFrame(pipeline.textures['shadowmap']);
        sprite.impl.shader = shaderLib.getShader(ss_depth);
        sprite.setWidth(200);
        sprite.setHeight(200);
        sprite.positionType = PositionType.Absolute;
        sprite.setPosition(Edge.Right, 0);
        sprite.setPosition(Edge.Bottom, 0);
        doc.addElement(sprite);

        const profiler = (new Node).addComponent(Profiler)
        profiler.positionType = PositionType.Absolute;
        profiler.setPosition(Edge.Left, 8)
        profiler.setPosition(Edge.Bottom, 8)
        doc.addElement(profiler);

        node = new Node;
        const cameraControlPanel = node.addComponent(CameraControlPanel);
        cameraControlPanel.camera = up_camera;
        cameraControlPanel.setWidth(width);
        cameraControlPanel.setHeight(height);
        doc.addElement(cameraControlPanel);

        node = guardian.createScene("Sketchfab_Scene")!;
        const animation = node.addComponent(Animation);
        animation.clips = guardian.gltf.animationClips;
        animation.play('WalkCycle')
        node.visibility = VisibilityFlagBits.DEFAULT;
        node.position = [0, -1, 0]

        node = plane.createScene("Plane")!;
        node.visibility = VisibilityFlagBits.DEFAULT
        node.scale = [5, 1, 5];
        node.position = [0, -1, 0]

        node = gltf_camera.createScene("Sketchfab_Scene")!;
        node.visibility = VisibilityFlagBits.DOWN
        node.scale = [0.005, 0.005, 0.005];
        node.euler = vec3.create(180, 0, 180)
        up_camera.node.addChild(node);

        return renderPipeline;
    }
}

