import { Camera, DirectionalLight, GLTF, Node, Pipeline, Zero, bundle as builtin, device, safeArea, vec3 } from "engine";
import { CameraControlPanel, Document, Edge, PositionType, Profiler } from "flex";

const pipeline = await (await builtin.cache('pipelines/forward', Pipeline)).instantiate();

const primitive = await (await builtin.cache('models/primitive/scene', GLTF)).instantiate();

enum VisibilityFlagBits {
    NONE = 0,
    UI = 1 << 29,
    WORLD = 1 << 30,
    ALL = 0xffffffff
}

class App extends Zero {
    protected start(): void {
        {
            const light = Node.build(DirectionalLight)
            light.node.position = [-12, 12, -12];
        }

        const up_camera = Node.build(Camera);
        up_camera.fov = 45;
        up_camera.viewport = { x: 0, y: 0.5, width: 1, height: 0.5 };
        up_camera.visibilities = VisibilityFlagBits.WORLD;
        up_camera.node.position = [0, 0, 6];

        const cube = primitive.createScene("Cube")!;
        cube.visibility = VisibilityFlagBits.WORLD;


        const width = 640;
        const height = 960;

        const swapchain = device.swapchain;
        const scale = Math.min(swapchain.width / width, swapchain.height / height);

        {
            const camera = Node.build(Camera);
            camera.orthoSize = swapchain.height / scale / 2;
            camera.near = -1;
            camera.far = 1;
            camera.visibilities = VisibilityFlagBits.UI;
            camera.clears = Camera.ClearFlagBits.DEPTH;
        }

        const doc = Node.build(Document);
        doc.setWidth(width);
        doc.setHeight(height);
        doc.setPadding(Edge.Top, safeArea.top / scale);
        doc.node.position = vec3.create(-width / 2, height / 2);
        doc.node.visibility = VisibilityFlagBits.UI;

        const cameraControlPanel = Node.build(CameraControlPanel);
        cameraControlPanel.setWidth(width);
        cameraControlPanel.setHeight(height);
        cameraControlPanel.camera = up_camera;
        doc.addElement(cameraControlPanel);

        const profiler = Node.build(Profiler);
        profiler.positionType = PositionType.Absolute;
        profiler.setPosition(Edge.Left, 8)
        profiler.setPosition(Edge.Bottom, 8)
        doc.addElement(profiler);
    }
}

(new App(pipeline)).initialize().attach();