
import { Camera, DirectionalLight, GLTF, MeshRenderer, Node, Pipeline, Zero, bundle, device, vec2, vec3, vec4 } from 'engine';
import { CameraControlPanel, Document, Edge, PositionType, Profiler } from 'flex';
import { BoxShape } from 'physics';
import Joystick from "./Joystick.js";
import Vehicle from "./Vehicle.js";

const primitive = await (await bundle.cache('models/primitive/scene', GLTF)).instantiate({ USE_SHADOW_MAP: 1, SHADOW_MAP_CASCADED: 1, SHADOW_MAP_PCF: 1 });

enum VisibilityFlagBits {
    NONE = 0,
    UI = 1 << 29,
    WORLD = 1 << 30,
    ALL = 0xffffffff
}

const pipeline = await (await bundle.cache('pipelines/shadow', Pipeline)).instantiate(VisibilityFlagBits);

export class App extends Zero {
    start() {
        const width = 640;
        const height = 960;

        const swapchain = device.swapchain;
        const scaleX = swapchain.width / width;
        const scaleY = swapchain.height / height;
        const scale = scaleX < scaleY ? scaleX : scaleY;

        let node: Node;

        // light
        const light = Node.build(DirectionalLight)
        light.node.position = [-12, 12, -12];
        light.node.lookAt(vec3.ZERO)

        node = new Node;
        const main_camera = node.addComponent(Camera);
        main_camera.fov = 45;
        main_camera.far = 64
        main_camera.visibilities = VisibilityFlagBits.WORLD;
        node.position = [16, 16, 16];

        // node = new Node;
        // node.visibility = VisibilityBit.DEFAULT;
        // node.addComponent(DebugDrawer);

        const ground_size = vec3.create(30, 0.2, 30);

        const ground = primitive.createScene("Cube", true)!.children[0];
        let meshRenderer = ground.getComponent(MeshRenderer)!
        meshRenderer.materials![0].passes[1].setUniform('Props', 'albedo', vec4.create(0.5, 0.5, 0.5, 1));
        ground.visibility = VisibilityFlagBits.WORLD;
        let shape = ground.addComponent(BoxShape);
        let aabb = meshRenderer.bounds;
        shape.size = vec3.create(aabb.halfExtent[0] * 2, aabb.halfExtent[1] * 2, aabb.halfExtent[2] * 2)
        ground.scale = [ground_size[0] / (aabb.halfExtent[0] * 2), ground_size[1] / (aabb.halfExtent[1] * 2), ground_size[2] / (aabb.halfExtent[2] * 2)]
        ground.position = [0, -ground_size[1] / 2, 0];

        const box_size = 1;
        const wall_size = vec2.create(6, 6);
        const wall_pos = vec3.create(0, 0, -8);

        const wall_left = wall_pos[0] - wall_size[0] * box_size / 2;
        const wall_bottom = wall_pos[1];
        for (let i = 0; i < wall_size[0]; i++) {
            let box_left = wall_left + box_size * i;
            for (let j = 0; j < wall_size[1]; j++) {
                let box_bottom = wall_bottom + box_size * j;

                const box_x = box_left + box_size / 2;
                const box_y = box_bottom + box_size / 2;
                const box_z = wall_pos[2];

                const box = primitive.createScene("Cube", true)!.children[0];
                box.visibility = VisibilityFlagBits.WORLD;
                let meshRenderer = box.getComponent(MeshRenderer)!
                meshRenderer.materials![0].passes[1].setUniform('Props', 'albedo', vec4.create(0, 0, 1, 1));
                shape = box.addComponent(BoxShape);
                shape.body.mass = 0.1;
                aabb = meshRenderer.bounds;
                shape.size = vec3.create(aabb.halfExtent[0] * 2, aabb.halfExtent[1] * 2, aabb.halfExtent[2] * 2)
                box.scale = [box_size / (aabb.halfExtent[0] * 2), box_size / (aabb.halfExtent[1] * 2), box_size / (aabb.halfExtent[2] * 2)]
                box.position = [box_x, box_y, box_z];
            }
        }

        node = new Node();
        const vehicle = node.addComponent(Vehicle);
        node.visibility = VisibilityFlagBits.WORLD;
        node.position = [0, 3, 0];

        // const lit_frustum = Node.build(Frustum);
        // lit_frustum.orthoSize = shadow.orthoSize;
        // lit_frustum.aspect = shadow.aspect;
        // lit_frustum.near = shadow.near;
        // lit_frustum.far = shadow.far;
        // lit_frustum.color = [1, 1, 0, 1];
        // const view = vec3.normalize(vec3.create(), light.node.position);
        // lit_frustum.node.rotation = quat.fromViewUp(quat.create(), view);
        // lit_frustum.node.position = light.node.position;
        // lit_frustum.node.visibility = VisibilityFlagBits.DEFAULT;

        // UI
        node = new Node;
        const ui_camera = node.addComponent(Camera);
        ui_camera.visibilities = VisibilityFlagBits.UI;
        ui_camera.clears = 0x2 // ClearFlagBits.DEPTH;
        ui_camera.orthoSize = swapchain.height / scale / 2;
        node.position = vec3.create(0, 0, width / 2);

        node = new Node;
        node.position = vec3.create(-width / 2, height / 2);
        node.visibility = VisibilityFlagBits.UI;
        const doc = node.addComponent(Document);
        doc.setWidth(width);
        doc.setHeight(height);

        node = new Node;
        const cameraControlPanel = node.addComponent(CameraControlPanel);
        cameraControlPanel.setWidth(width);
        cameraControlPanel.setHeight(height);
        cameraControlPanel.camera = main_camera;
        doc.addElement(cameraControlPanel);

        node = new Node;
        const joystick = node.addComponent(Joystick);
        this.setInterval(() => {
            // const speed = vehicle.speedKmHour;

            // let breakingForce = 0;
            let engineForce = 0;
            let steering = 0;
            if (joystick.point[1] > 0) {
                engineForce = 2
            } else if (joystick.point[1] < 0) {
                engineForce = -2
            }
            if (joystick.point[0] > 0) {
                steering = 6;
            } else if (joystick.point[0] < 0) {
                steering = -6;
            }

            vehicle.setEngineForce(engineForce, 2);
            vehicle.setEngineForce(engineForce, 3);
            vehicle.setSteeringValue(steering, 0);
            vehicle.setSteeringValue(steering, 1);
        })
        joystick.positionType = PositionType.Absolute;
        joystick.setPosition(Edge.Right, 0);
        joystick.setPosition(Edge.Bottom, 0);
        joystick.setWidth(height / 4);
        joystick.setHeight(height / 4);
        doc.addElement(joystick);

        node = new Node(Profiler.name)
        const profiler = node.addComponent(Profiler)
        profiler.positionType = PositionType.Absolute;
        profiler.setPosition(Edge.Left, 8)
        profiler.setPosition(Edge.Bottom, 8)
        doc.addElement(profiler);
    }
}

(new App(pipeline)).initialize().attach();
