import { Camera, DirectionalLight, Frustum, GLTF, Node, Pipeline, Primitive, Zero, bundle as builtin, device, vec3 } from "engine";
import { CameraControlPanel, Document, Edge, ElementContainer, PositionType, Profiler } from "flex";

const pipeline = await (await builtin.cache('pipelines/forward', Pipeline)).instantiate();

const primitive = await (await builtin.cache('models/primitive/scene', GLTF)).instantiate();

enum VisibilityFlagBits {
    NONE = 0,
    UI = 1 << 28,
    UP = 1 << 29,
    DOWN = 1 << 30,
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
        up_camera.far = 10
        up_camera.viewport = { x: 0, y: 0.5, width: 1, height: 0.5 };
        up_camera.visibilities = VisibilityFlagBits.UP;
        up_camera.node.position = [0, 0, 6];

        const down_camera = Node.build(Camera);
        down_camera.orthoSize = 6;
        down_camera.viewport = { x: 0, y: 0, width: 1, height: 0.5 };
        down_camera.visibilities = VisibilityFlagBits.DOWN;
        down_camera.node.position = [8, 8, 8]

        const cube = primitive.createScene("Cube")!;
        cube.visibility = VisibilityFlagBits.UP | VisibilityFlagBits.DOWN;

        const frustum = Node.build(Frustum);
        frustum.fov = up_camera.fov;
        frustum.aspect = up_camera.aspect;
        frustum.near = up_camera.near;
        frustum.far = up_camera.far;
        frustum.node.visibility = VisibilityFlagBits.DOWN;
        up_camera.node.addChild(frustum.node);

        const debugDrawer = Node.build(Primitive);
        debugDrawer.node.visibility = VisibilityFlagBits.DOWN;
        this.setInterval(() => {
            for (const model of this.scene.models) {
                model.world_bounds
            }
        })

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
        // doc.setPadding(Edge.Top, safeArea.top / scale);
        doc.node.position = vec3.create(-width / 2, height / 2);
        doc.node.visibility = VisibilityFlagBits.UI;

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
        }
        doc.addElement(down_container)

        const profiler = Node.build(Profiler);
        profiler.positionType = PositionType.Absolute;
        profiler.setPosition(Edge.Left, 8)
        profiler.setPosition(Edge.Bottom, 8)
        doc.addElement(profiler);
    }
}

(new App(pipeline)).initialize().attach();