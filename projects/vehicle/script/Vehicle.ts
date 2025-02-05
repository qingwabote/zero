import { Component, GLTF, MeshRenderer, Node, quat, vec3, vec4 } from "engine";
import { BoxShape, PhysicsSystem } from "physics";

const chassis_size = vec3.create(1.8, 0.6, 4);

const wheel_radius = .4;
const wheel_width = .3;
const wheel_halfTrack = 1;
const wheel_axis_height = .3;
const wheel_axis_front_position = -1.7;
const wheel_axis_back_position = 1;

const wheel_create_infos = [
    {
        position: vec3.create(wheel_halfTrack, wheel_axis_height, wheel_axis_front_position),
        isFront: true
    },
    {
        position: vec3.create(-wheel_halfTrack, wheel_axis_height, wheel_axis_front_position),
        isFront: true
    },
    {
        position: vec3.create(wheel_halfTrack, wheel_axis_height, wheel_axis_back_position),
        isFront: false
    },
    {
        position: vec3.create(-wheel_halfTrack, wheel_axis_height, wheel_axis_back_position),
        isFront: false
    }
]

const suspension_restLength = 0.6;

const ammo = PhysicsSystem.instance.impl;

const bt_vec3_a = new ammo.btVector3(0, 0, 0);
const bt_vec3_b = new ammo.btVector3(0, 0, 0);
const bt_vec3_c = new ammo.btVector3(0, 0, 0);

export default class Vehicle extends Component {
    private _impl;

    private _wheels!: Node[];

    get speedKmHour(): number {
        return this._impl.getCurrentSpeedKmHour()
    }

    primitive!: GLTF.Instance;

    public setEngineForce(value: number, wheel: number) {
        this._impl.applyEngineForce(-value, wheel);
    }

    public setBrake(value: number, wheel: number) {
        this._impl.setBrake(value, wheel);
    }

    public setSteeringValue(value: number, wheel: number) {
        this._impl.setSteeringValue(value, wheel);
    }

    constructor(node: Node) {
        super(node);

        const shape = this.node.addComponent(BoxShape);
        shape.size = chassis_size
        shape.body.mass = 1;
        shape.body.impl.impl.setActivationState(4);

        const tuning = new ammo.btVehicleTuning();
        const rayCaster = new ammo.btDefaultVehicleRaycaster(PhysicsSystem.instance.world.impl)
        const vehicle = new ammo.btRaycastVehicle(tuning, shape.body.impl.impl, rayCaster);
        vehicle.setCoordinateSystem(0, 1, 2);

        for (const info of wheel_create_infos) {
            bt_vec3_a.setValue(...info.position);
            bt_vec3_b.setValue(0, -1, 0);
            bt_vec3_c.setValue(-1, 0, 0);
            const wheel = vehicle.addWheel(bt_vec3_a, bt_vec3_b, bt_vec3_c, suspension_restLength, wheel_radius, tuning, info.isFront)
            wheel.set_m_suspensionStiffness(20);
        }

        PhysicsSystem.instance.world.impl.addAction(vehicle);

        this._impl = vehicle;
    }

    override start(): void {
        const cube = this.primitive.createScene("Cube")!.children[0];
        let meshRenderer = cube.getComponent(MeshRenderer)!;
        const material = meshRenderer.materials![0];
        material.passes[1] = material.passes[1].copy().setPropertyByName('albedo', vec4.create(1, 0, 0, 1));
        cube.scale = vec3.multiply(vec3.create(), chassis_size, [0.5, 0.5, 0.5]);
        this.node.addChild(cube);

        const wheels: Node[] = new Array(wheel_create_infos.length);
        for (let i = 0; i < wheels.length; i++) {
            const node = new Node;
            const cylinder = this.primitive.createScene("Cylinder")!.children[0];
            cylinder.scale = vec3.create(wheel_radius, wheel_width / 2, wheel_radius)
            cylinder.euler = vec3.create(0, 0, 90)
            node.addChild(cylinder)
            const cube = this.primitive.createScene("Cube")!.children[0];
            cube.scale = vec3.create(wheel_width / 2 + 0.01, wheel_radius - 0.01, wheel_radius / 3)
            let meshRenderer = cube.getComponent(MeshRenderer)!;
            const material = meshRenderer.materials![0];
            material.passes[1] = material.passes[1].copy().setPropertyByName('albedo', vec4.create(1, 0, 0, 1));
            node.addChild(cube)
            this.node.addChild(node);
            wheels[i] = node;
        }
        this._wheels = wheels;
    }

    override lateUpdate(): void {
        var n = this._impl.getNumWheels();
        for (let i = 0; i < n; i++) {
            this._impl.updateWheelTransform(i, true);
            const tm = this._impl.getWheelTransformWS(i);
            const p = tm.getOrigin();
            const q = tm.getRotation();
            const node = this._wheels[i];
            node.world_position = vec3.create(p.x(), p.y(), p.z());
            node.world_rotation = quat.create(q.x(), q.y(), q.z(), q.w());
        }
    }
}