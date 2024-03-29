import { bundle } from 'bundling';
import { Animation, Camera, DirectionalLight, GLTF, GeometryRenderer, Node, Pipeline, Shader, ShadowUniform, SpriteFrame, SpriteRenderer, Zero, bundle as builtin, device, frustum, shaderLib, vec3, vec4 } from 'engine';
import { CameraControlPanel, Document, Edge, ElementContainer, PositionType, Profiler, Renderer, Slider, SliderEventType } from 'flex';

const VisibilityFlagBits = {
    UP: 1 << 1,
    DOWN: 1 << 2,
    UI: 1 << 29,
    WORLD: 1 << 30
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

const frustumVertices_a = frustum.vertices()
const frustumFaces_a = frustum.faces()

export class App extends Zero {
    protected override start() {
        const width = 640;
        const height = 960;

        const swapchain = device.swapchain;
        const scaleX = swapchain.width / width;
        const scaleY = swapchain.height / height;
        const scale = scaleX < scaleY ? scaleX : scaleY;

        const light = Node.build(DirectionalLight);
        light.node.position = [4, 4, 4];
        light.node.lookAt(vec3.ZERO)
        // node.visibility = Visibility_Up;


        let node: Node;

        // cameras
        node = new Node;
        const up_camera = node.addComponent(Camera);
        up_camera.visibilities = VisibilityFlagBits.WORLD | VisibilityFlagBits.UP;
        up_camera.fov = 45;
        up_camera.far = 16;
        up_camera.viewport = { x: 0, y: 0.5, width: 1, height: 0.5 };
        node.position = [0, 0, 10];

        node = new Node;
        const down_camera = node.addComponent(Camera);
        down_camera.visibilities = VisibilityFlagBits.WORLD | VisibilityFlagBits.DOWN;
        down_camera.orthoSize = 8;
        down_camera.viewport = { x: 0, y: 0, width: 1, height: 0.5 };
        node.position = [-8, 8, 8];

        node = guardian.createScene("Sketchfab_Scene")!;
        const animation = node.addComponent(Animation);
        animation.clips = guardian.proto.animationClips;
        animation.play('WalkCycle')
        node.visibility = VisibilityFlagBits.WORLD;
        node.position = [0, -1, 0]

        node = plane.createScene("Plane")!;
        node.visibility = VisibilityFlagBits.WORLD
        node.scale = [5, 1, 5];
        node.position = [0, -1, 0];

        const shadow = renderPipeline.flows[0].uniforms.find(uniform => uniform instanceof ShadowUniform) as ShadowUniform;

        const lit_frustum = frustum.fromOrthographic(frustum.vertices(), shadow.orthoSize, shadow.aspect, shadow.near, shadow.far);
        const up_frustum = frustum.fromPerspective(frustum.vertices(), up_camera.fov, up_camera.aspect, up_camera.near, up_camera.far);

        const debugDrawer = Node.build(GeometryRenderer);
        debugDrawer.node.visibility = VisibilityFlagBits.DOWN;

        this.setInterval(() => {
            debugDrawer.clear()

            frustum.transform(frustumVertices_a, lit_frustum, light.node.world_matrix);
            debugDrawer.drawFrustum(frustumVertices_a, vec4.YELLOW);


            frustum.transform(frustumVertices_a, up_frustum, up_camera.node.world_matrix);
            debugDrawer.drawFrustum(frustumVertices_a, vec4.ONE);

            // frustum.toFaces(frustumFaces_a, frustumVertices_a);

            // perspectiveDrawer.clear();
            // perspectiveDrawer.drawFrustum(frustumVertices_a);

            for (const model of this.scene.models) {
                if (model.transform.visibility != VisibilityFlagBits.WORLD) {
                    continue;
                }
                // if (frustum.aabb(frustumFaces_a, model.world_bounds)) {
                //     aabbDrawer.drawAABB(model.world_bounds, vec4.RED);
                // } else {
                //     aabbDrawer.drawAABB(model.world_bounds, vec4.ONE);
                // }
                debugDrawer.drawAABB(model.world_bounds, vec4.RED);
            }
        })

        // UI
        node = new Node;
        const ui_camera = node.addComponent(Camera);
        ui_camera.visibilities = VisibilityFlagBits.UI;
        ui_camera.clears = Camera.ClearFlagBits.DEPTH;
        ui_camera.orthoSize = swapchain.height / scale / 2;
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
                frustum.fromOrthographic(lit_frustum, shadow.orthoSize, shadow.aspect, shadow.near, shadow.far);
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
    }
}

(new App(renderPipeline)).initialize().attach();
