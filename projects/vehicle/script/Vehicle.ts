import { Component, GLTF, MeshRenderer, Node, Vec3, bundle, quat, vec3, vec4 } from "engine";
import { BoxShape, PhysicsSystem } from "physics";

const primitive = await (await bundle.cache('models/primitive/scene', GLTF)).instantiate({ USE_SHADOW_MAP: 1 });

const chassis_size = vec3.create(1.8, 0.6, 4);

const wheel_radius = .4;
const wheel_width = .3;
const wheel_halfTrack = 1;
const wheel_axis_height = .3;
const wheel_axis_front_position = -1.7;
const wheel_axis_back_position = 1;

const suspension_restLength = 0.6;

const ammo = PhysicsSystem.instance.impl;

const bt_vec3_a = new ammo.btVector3(0, 0, 0);
const bt_vec3_b = new ammo.btVector3(0, 0, 0);
const bt_vec3_c = new ammo.btVector3(0, 0, 0);

export default class Vehicle extends Component {
    private _impl;

    private _wheels: Node[] = [];

    get speedKmHour(): number {
        return this._impl.getCurrentSpeedKmHour()
    }

    constructor(node: Node) {
        super(node);

        const cube = primitive.createScene("Cube", true)!.children[0];
        let meshRenderer = cube.getComponent(MeshRenderer)!;
        meshRenderer.materials[0].passes[1].setUniform('Props', 'albedo', vec4.create(1, 0, 0, 1));
        cube.scale = vec3.scale(vec3.create(), chassis_size, 0.5)
        node.addChild(cube);

        let shape = node.addComponent(BoxShape);
        shape.size = chassis_size
        shape.body.mass = 1;
        shape.body.impl.impl.setActivationState(4);

        const tuning = new ammo.btVehicleTuning();
        const rayCaster = new ammo.btDefaultVehicleRaycaster(PhysicsSystem.instance.world.impl)
        const vehicle = new ammo.btRaycastVehicle(tuning, shape.body.impl.impl, rayCaster);
        vehicle.setCoordinateSystem(0, 1, 2);
        this.addWheel(
            vehicle,
            vec3.create(wheel_halfTrack, wheel_axis_height, wheel_axis_front_position),
            tuning,
            true);
        this.addWheel(
            vehicle,
            vec3.create(-wheel_halfTrack, wheel_axis_height, wheel_axis_front_position),
            tuning,
            true);
        this.addWheel(
            vehicle,
            vec3.create(wheel_halfTrack, wheel_axis_height, wheel_axis_back_position),
            tuning,
            false);
        this.addWheel(
            vehicle,
            vec3.create(-wheel_halfTrack, wheel_axis_height, wheel_axis_back_position),
            tuning,
            false);
        PhysicsSystem.instance.world.impl.addAction(vehicle);
        this._impl = vehicle;
    }

    public setEngineForce(value: number, wheel: number) {
        this._impl.applyEngineForce(-value, wheel);
    }

    public setBrake(value: number, wheel: number) {
        this._impl.setBrake(value, wheel);
    }

    public setSteeringValue(value: number, wheel: number) {
        this._impl.setSteeringValue(value, wheel);
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

    private addWheel(impl: any, pos: Vec3, tuning: any, isFront: boolean) {
        bt_vec3_a.setValue(...pos);
        bt_vec3_b.setValue(0, -1, 0);
        bt_vec3_c.setValue(-1, 0, 0);
        const wheelInfo = impl.addWheel(bt_vec3_a, bt_vec3_b, bt_vec3_c, suspension_restLength, wheel_radius, tuning, isFront)
        wheelInfo.set_m_suspensionStiffness(20);

        const node = new Node;
        const cylinder = primitive.createScene("Cylinder")!.children[0];
        cylinder.scale = vec3.create(wheel_radius, wheel_width / 2, wheel_radius)
        cylinder.euler = vec3.create(0, 0, 90)
        node.addChild(cylinder)
        const cube = primitive.createScene("Cube", true)!.children[0];
        cube.scale = vec3.create(wheel_width / 2 + 0.01, wheel_radius - 0.01, wheel_radius / 3)
        let meshRenderer = cube.getComponent(MeshRenderer)!;
        meshRenderer.materials[0].passes[1].setUniform('Props', 'albedo', vec4.create(1, 0, 0, 1));
        node.addChild(cube)
        this.node.addChild(node);
        this._wheels.push(node);
    }
}