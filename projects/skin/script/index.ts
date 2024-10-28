import { bundle } from 'bundling';
import { Animation, Camera, DirectionalLight, GLTF, Node, Pipeline, Vec3, Zero, bundle as builtin, device, mat3, vec3 } from "engine";
import { Align, CameraControlPanel, Document, Edge, Justify, PositionType, Profiler } from 'flex';

enum VisibilityFlagBits {
    NONE = 0,
    UI = 1 << 29,
    WORLD = 1 << 30,
    ALL = 0xffffffff
}

const macros = { USE_SHADOW_MAP: 1, SHADOW_MAP_CASCADED: 0, SHADOW_MAP_PCF: 0 }

const [walkrun_and_idle, primitive, pipeline] = await Promise.all([
    await (await bundle.once('walkrun_and_idle/scene', GLTF)).instantiate(macros, function (params: GLTF.MaterialParams) {
        const res = GLTF.materialFuncPhong(params);
        if (params.index == 3 /* hair */) {
            res.passes[1].rasterizationState = { cullMode: 'FRONT' };
        }
        return res
    }),
    await (await builtin.cache('models/primitive/scene', GLTF)).instantiate(macros),
    await (await builtin.cache('pipelines/forward-csm-1', Pipeline)).instantiate(VisibilityFlagBits)
])

export class App extends Zero {
    start() {
        const width = 640;
        const height = 960;

        const { width: w, height: h } = device.swapchain.color.info;

        const scaleX = w / width;
        const scaleY = h / height;
        const scale = scaleX < scaleY ? scaleX : scaleY;

        let node: Node;

        // light
        node = new Node;
        node.addComponent(DirectionalLight);
        node.position = [4, 4, 4];
        node.lookAt(vec3.ZERO);

        node = new Node;
        const main_camera = node.addComponent(Camera);
        main_camera.fov = 45;
        main_camera.far = 32;
        main_camera.visibilities = VisibilityFlagBits.WORLD;
        node.position = [12, 12, 12];

        node = primitive.createScene("Plane")!;
        node.visibility = VisibilityFlagBits.WORLD
        node.scale = [5, 1, 5];
        node.position = [0, 0, 0];

        const circles: [Vec3, number][] = [
            [vec3.create(0, 0, -1.5), 6],
            [vec3.create(0, 0, -3), 10],
            [vec3.create(0, 0, -4.5), 22]
        ]
        for (let i = 0; i < circles.length; i++) {
            const [origin, steps] = circles[i];
            const stride = mat3.fromYRotation(mat3.create(), Math.PI * 2 / steps);
            for (let j = 0; j < steps; j++) {
                node = walkrun_and_idle.createScene("Sketchfab_Scene")!;
                node.visibility = VisibilityFlagBits.WORLD;
                const animation = node.addComponent(Animation);
                animation.clips = walkrun_and_idle.proto.animationClips;
                animation.play(animation.clips[j % 3].name);
                node.position = vec3.transformMat3(origin, origin, stride);
            }
        }

        // UI
        node = new Node;
        const ui_camera = node.addComponent(Camera);
        ui_camera.visibilities = VisibilityFlagBits.UI;
        ui_camera.clears = 0x2 // ClearFlagBits.DEPTH;
        ui_camera.orthoSize = h / scale / 2;
        node.position = vec3.create(0, 0, width / 2);

        node = new Node;
        node.position = vec3.create(-width / 2, height / 2);
        node.visibility = VisibilityFlagBits.UI;
        const doc = node.addComponent(Document);
        doc.justifyContent = Justify.Center
        doc.alignItems = Align.Center
        doc.setWidth(width);
        doc.setHeight(height);

        node = new Node;
        const cameraControlPanel = node.addComponent(CameraControlPanel);
        cameraControlPanel.camera = main_camera;
        cameraControlPanel.setWidth(width);
        cameraControlPanel.setHeight(height);
        doc.addElement(cameraControlPanel);

        const profiler = (new Node).addComponent(Profiler)
        profiler.positionType = PositionType.Absolute;
        profiler.setPosition(Edge.Left, 8)
        profiler.setPosition(Edge.Bottom, 8)
        doc.addElement(profiler);
    }
}

(new App(pipeline)).initialize().attach();
