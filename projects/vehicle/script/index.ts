
import { Camera, DirectionalLight, GLTF, MeshRenderer, Node, Pipeline, Zero, bundle, device, vec2, vec3, vec4 } from 'engine';
import { CameraControl, Document, Edge, PositionType, Profiler } from 'flex';
import { BoxShape, DebugDrawer, PhysicsSystem, vehicle } from 'physics';
import { Frame } from './Frame.js';
import { FrameRemote } from './FrameRemote.js';
import { Joystick } from './Joystick.js';
import { JoystickInput } from './JoystickInput.js';

const primitive = await (await bundle.cache('models/primitive', GLTF)).instantiate({ USE_SHADOW_MAP: 1, SHADOW_MAP_CASCADED: 1, SHADOW_MAP_PCF: 1 });

enum VisibilityFlagBits {
    NONE = 0,
    UI = 1 << 29,
    WORLD = 1 << 30,
    ALL = 0xffffffff
}

const pipeline = await (await bundle.cache('pipelines/forward-csm', Pipeline)).instantiate(VisibilityFlagBits);

const chassis_size = vec3.create(1.8, 0.6, 4);

const wheel_radius = .4;
const wheel_width = .3;
const wheel_halfTrack = 1;
const wheel_axis_height = .3;
const wheel_axis_front_position = -1.7;
const wheel_axis_back_position = 1;

const wheel_create_infos = [
    {
        connection: vec3.create(wheel_halfTrack, wheel_axis_height, wheel_axis_front_position),
        front: true
    },
    {
        connection: vec3.create(-wheel_halfTrack, wheel_axis_height, wheel_axis_front_position),
        front: true
    },
    {
        connection: vec3.create(wheel_halfTrack, wheel_axis_height, wheel_axis_back_position),
        front: false
    },
    {
        connection: vec3.create(-wheel_halfTrack, wheel_axis_height, wheel_axis_back_position),
        front: false
    }
]

let frame: Frame = new FrameRemote;

Zero.unregisterSystem(PhysicsSystem.instance);
Zero.registerSystem(frame, 1);

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
        const light = Node.build(DirectionalLight)
        light.node.position = [-12, 12, -12];
        light.node.lookAt(vec3.ZERO)

        node = new Node;
        const main_camera = node.addComponent(Camera);
        main_camera.fov = 45;
        main_camera.far = 64
        main_camera.visibilities = VisibilityFlagBits.WORLD;
        node.position = [16, 16, 16];

        node = new Node;
        node.visibility = VisibilityFlagBits.WORLD;
        node.addComponent(DebugDrawer);

        const ground_size = vec3.create(30, 0.2, 30);

        const ground = primitive.createScene("Cube")!.children[0];
        let meshRenderer = ground.getComponent(MeshRenderer)!
        ground.visibility = VisibilityFlagBits.WORLD;
        ground.scale = ground_size;
        ground.position = [0, -ground_size[1] / 2, 0];
        let shape = ground.addComponent(BoxShape);

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

                const box = primitive.createScene("Cube")!.children[0];
                box.visibility = VisibilityFlagBits.WORLD;
                box.scale = [box_size, box_size, box_size];
                box.position = [box_x, box_y, box_z];
                let meshRenderer = box.getComponent(MeshRenderer)!;
                const material = meshRenderer.materials![0];
                material.passes[1] = material.passes[1].copy().setPropertyByName('albedo', vec4.create(0, 0, 1, 1));
                shape = box.addComponent(BoxShape);
                shape.body.mass = 0.1;
            }
        }

        const cube = primitive.createScene("Cube")!.children[0];
        meshRenderer = cube.getComponent(MeshRenderer)!;
        const material = meshRenderer.materials![0];
        material.passes[1] = material.passes[1].copy().setPropertyByName('albedo', vec4.create(0.1, 0, 0, 1));
        cube.scale = chassis_size;
        cube.visibility = VisibilityFlagBits.WORLD;
        cube.position = [0, 3, 0];
        const chassis = cube.addComponent(vehicle.Chassis);
        chassis.mass = 1;
        const wheels: vehicle.Wheel[] = [];
        for (const info of wheel_create_infos) {
            const node = new Node;
            node.visibility = VisibilityFlagBits.WORLD;
            const cylinder = primitive.createScene("Cylinder")!.children[0];
            cylinder.scale = vec3.create(wheel_radius * 2, wheel_width, wheel_radius * 2)
            cylinder.euler = vec3.create(0, 0, 90)
            node.addChild(cylinder)
            const cube = primitive.createScene("Cube")!.children[0];
            cube.scale = vec3.create(wheel_width + 0.01, wheel_radius * 2 - 0.01, wheel_radius * 2 / 3)
            const meshRenderer = cube.getComponent(MeshRenderer)!;
            const material = meshRenderer.materials![0];
            material.passes[1] = material.passes[1].copy().setPropertyByName('albedo', vec4.create(1, 0, 0, 1));
            const wheel = node.addComponent(vehicle.Wheel);
            wheel.connection = info.connection;
            wheel.front = info.front;
            wheel.radius = wheel_radius;
            wheel.chassis = chassis;
            wheels.push(wheel);
            node.addChild(cube)
        }


        // UI
        node = new Node;
        const ui_camera = node.addComponent(Camera);
        ui_camera.visibilities = VisibilityFlagBits.UI;
        ui_camera.clears = 0x2 // ClearFlagBits.DEPTH;
        ui_camera.orthoSize = h / scale / 2;
        node.position = vec3.create(0, 0, width / 2);

        node = new Node;
        node.position = vec3.create(-w / scale / 2, h / scale / 2);
        node.visibility = VisibilityFlagBits.UI;
        const doc = node.addComponent(Document);
        doc.setWidth(w / scale);
        doc.setHeight(h / scale);

        const cameraControl = doc.node.addComponent(CameraControl);
        cameraControl.camera = main_camera;

        const input = frame.input;
        input.on(JoystickInput.Events.CHANGE, () => {
            let engineForce = 0;
            let steering = 0;
            if (input.point[1] > 0) {
                engineForce = 2
            } else if (input.point[1] < 0) {
                engineForce = -2
            }
            if (input.point[0] > 0) {
                steering = 6;
            } else if (input.point[0] < 0) {
                steering = -6;
            }

            wheels[2].force = engineForce;
            wheels[3].force = engineForce;

            wheels[0].steering = steering;
            wheels[1].steering = steering;
        })
        frame.start();

        node = new Node;
        const joystick = node.addComponent(Joystick);
        joystick.input = input;
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
