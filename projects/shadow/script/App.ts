import { bundle } from 'bundling';
import { Animation, Camera, DirectionalLight, Frustum, GLTF, Node, Pipeline, Shader, ShadowUniform, SpriteFrame, SpriteRenderer, Vec3, Zero, bundle as builtin, device, quat, render, shaderLib, vec3 } from 'engine';
import { CameraControlPanel, Document, Edge, ElementContainer, PositionType, Profiler, Renderer, Slider, SliderEventType } from 'flex';

const VisibilityFlagBits = {
    UP: 1 << 1,
    DOWN: 1 << 2,
    UI: 1 << 29,
    DEFAULT: 1 << 30
} as const

const [guardian, plane, ss_depth, pipeline] = await Promise.all([
    (async function () {
        const gltf = await bundle.cache('guardian_zelda_botw_fan-art/scene', GLTF);
        return gltf.instantiate({ USE_SHADOW_MAP: 1 });
    })(),
    (async function () {
        const gltf = await builtin.cache('models/primitive/scene', GLTF);
        return gltf.instantiate({ USE_SHADOW_MAP: 1 });
    })(),
    builtin.cache('shaders/depth', Shader),
    bundle.cache('pipelines/test', Pipeline)
])

const renderPipeline = await pipeline.instantiate(VisibilityFlagBits);

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
        up_camera.far = 16;
        up_camera.viewport = { x: 0, y: swapchain.height / 2, width: swapchain.width, height: swapchain.height / 2 };
        node.position = [0, 0, 10];

        node = new Node;
        const down_camera = node.addComponent(Camera);
        down_camera.visibilities = VisibilityFlagBits.DEFAULT | VisibilityFlagBits.DOWN;
        down_camera.orthoSize = 8;
        down_camera.viewport = { x: 0, y: 0, width: swapchain.width, height: swapchain.height / 2 };
        node.position = [-8, 8, 8];
        let view = vec3.normalize(vec3.create(), node.position);
        node.rotation = quat.fromViewUp(quat.create(), view);

        node = guardian.createScene("Sketchfab_Scene")!;
        const animation = node.addComponent(Animation);
        animation.clips = guardian.proto.animationClips;
        animation.play('WalkCycle')
        node.visibility = VisibilityFlagBits.DEFAULT;
        node.position = [0, -1, 0]

        node = plane.createScene("Plane")!;
        node.visibility = VisibilityFlagBits.DEFAULT
        node.scale = [5, 1, 5];
        node.position = [0, -1, 0];

        const shadow = renderPipeline.flows[0].uniforms.find(uniform => uniform instanceof ShadowUniform) as ShadowUniform

        const lit_frustum = Node.build(Frustum);
        lit_frustum.orthoSize = shadow.orthoSize;
        lit_frustum.aspect = shadow.aspect;
        lit_frustum.near = shadow.near;
        lit_frustum.far = shadow.far;
        lit_frustum.color = [1, 1, 0, 1];
        view = vec3.normalize(vec3.create(), lit_position);
        lit_frustum.node.rotation = quat.fromViewUp(quat.create(), view);
        lit_frustum.node.position = lit_position;
        lit_frustum.node.visibility = VisibilityFlagBits.DOWN;

        const up_frustum = Node.build(Frustum);
        up_frustum.fov = up_camera.fov;
        up_frustum.aspect = up_camera.viewport.width / up_camera.viewport.height;
        up_frustum.near = up_camera.near;
        up_frustum.far = up_camera.far;
        up_frustum.node.visibility = VisibilityFlagBits.DOWN;
        up_camera.node.addChild(up_frustum.node);

        // UI
        node = new Node;
        const ui_camera = node.addComponent(Camera);
        ui_camera.visibilities = VisibilityFlagBits.UI;
        ui_camera.clears = Camera.ClearFlagBits.DEPTH;
        ui_camera.orthoSize = swapchain.height / scale / 2;
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

        const up_container = Node.build(ElementContainer)
        up_container.setWidth(width);
        up_container.setHeight(height / 2);
        {
            const controlPanel = Node.build(CameraControlPanel);
            controlPanel.camera = up_camera;
            controlPanel.setWidth('100%');
            controlPanel.setHeight('100%');
            up_container.addElement(controlPanel);
        }
        doc.addElement(up_container)

        const down_container = Node.build(ElementContainer)
        down_container.setWidth(width);
        down_container.setHeight(height / 2);
        {
            const controlPanel = Node.build(CameraControlPanel);
            controlPanel.camera = down_camera;
            controlPanel.positionType = PositionType.Absolute;
            controlPanel.setWidth('100%');
            controlPanel.setHeight('100%');
            down_container.addElement(controlPanel);

            function updateValue(value: number) {
                shadow.orthoSize = 10 * value;
                lit_frustum.orthoSize = shadow.orthoSize;
            }

            const slider = Node.build(Slider)
            slider.setWidth(180)
            slider.setHeight(20)
            slider.value = 0.5;
            slider.emitter.on(SliderEventType.CHANGED, () => {
                updateValue(slider.value)
            })
            updateValue(slider.value)
            down_container.addElement(slider);
        }
        doc.addElement(down_container)

        return renderPipeline;
    }
}

