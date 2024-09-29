import { bundle } from 'bundling';
import { Animation, Camera, DirectionalLight, GLTF, Node, Pipeline, Zero, bundle as builtin, device, vec3 } from 'engine';
import { CameraControlPanel, Document, Edge, ElementContainer, PositionType, Profiler } from 'flex';

const VisibilityFlagBits = {
    UI: 1 << 29,
    WORLD: 1 << 30
} as const

const [guardian, plane, pipeline] = await Promise.all([
    (async function () {
        const gltf = await bundle.cache('guardian_zelda_botw_fan-art/scene', GLTF);
        return gltf.instantiate({ USE_SHADOW_MAP: 1, SHADOW_MAP_CASCADED: 1 });
    })(),
    (async function () {
        const gltf = await builtin.cache('models/primitive/scene', GLTF);
        return gltf.instantiate({ USE_SHADOW_MAP: 1, SHADOW_MAP_CASCADED: 1 });
    })(),
    (async function () {
        const pipeline = await builtin.cache('pipelines/shadow', Pipeline)
        return pipeline.instantiate(VisibilityFlagBits);
    })(),
])

export class App extends Zero {
    protected override start() {
        const width = 640;
        const height = 960;

        const { width: w, height: h } = device.swapchain.color.info;

        const scaleX = w / width;
        const scaleY = h / height;
        const scale = scaleX < scaleY ? scaleX : scaleY;

        const light = Node.build(DirectionalLight);
        light.node.position = [4, 4, 4];
        light.node.lookAt(vec3.ZERO)
        // node.visibility = Visibility_Up;


        let node: Node;

        node = new Node;
        const up_camera = node.addComponent(Camera);
        up_camera.visibilities = VisibilityFlagBits.WORLD;
        up_camera.fov = 45;
        up_camera.far = 64;
        node.position = [0, 6, 32];

        const guardian_positions = [vec3.create(-4, 3, -4), vec3.create(4, 3, -4), vec3.create(-4, 3, 4), vec3.create(4, 3, 4)]
        for (const position of guardian_positions) {
            node = guardian.createScene("Sketchfab_Scene")!;
            const animation = node.addComponent(Animation);
            animation.clips = guardian.proto.animationClips;
            animation.play('WalkCycle')
            node.visibility = VisibilityFlagBits.WORLD;
            node.position = position
        }

        node = plane.createScene("Plane")!;
        node.visibility = VisibilityFlagBits.WORLD
        node.scale = [8, 1, 8];
        node.position = [0, 3, 0];

        // UI
        node = new Node;
        const ui_camera = node.addComponent(Camera);
        ui_camera.visibilities = VisibilityFlagBits.UI;
        ui_camera.clears = Camera.ClearFlagBits.DEPTH;
        ui_camera.orthoSize = h / scale / 2;
        node.position = vec3.create(0, 0, width / 2);

        node = new Node;
        node.position = vec3.create(-width / 2, height / 2);
        node.visibility = VisibilityFlagBits.UI;
        const doc = node.addComponent(Document);
        doc.setWidth(width);
        doc.setHeight(height);

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

        }
        doc.addElement(down_container)
    }
}

(new App(pipeline)).initialize().attach();
