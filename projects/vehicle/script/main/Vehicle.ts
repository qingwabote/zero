import GLTF from "../../../../script/main/assets/GLTF.js";
import MeshRenderer from "../../../../script/main/components/MeshRenderer.js";
import BoxShape from "../../../../script/main/components/physics/BoxShape.js";
import assetLib from "../../../../script/main/core/assetLib.js";
import Component from "../../../../script/main/core/Component.js";
import quat from "../../../../script/main/core/math/quat.js";
import vec3, { Vec3 } from "../../../../script/main/core/math/vec3.js";
import vec4 from "../../../../script/main/core/math/vec4.js";
import Node from "../../../../script/main/core/Node.js";
import PhysicsSystem from "../../../../script/main/physics/PhysicsSystem.js";

const gltf_primitive = await assetLib.load('../../assets/models/primitive/scene', GLTF);

const chassis_size = vec3.create(1.8, 0.6, 4);

const wheel_radius = .4;
const wheel_width = .3;
const wheel_halfTrack = 1;
const wheel_axis_height = .3;
const wheel_axis_front_position = -1.7;
const wheel_axis_back_position = 1;

const suspension_restLength = 0.6;

export default class Vehicle extends Component {
    private _impl;

    private _wheels: Node[] = [];

    get speedKmHour(): number {
        return this._impl.getCurrentSpeedKmHour()
    }

    constructor(node: Node) {
        super(node);

        const cube = gltf_primitive.createScene("Cube", true)!.children[0];
        let meshRenderer = cube.getComponent(MeshRenderer)!;
        meshRenderer.materials[0].passes[0].setUniform('Constants', 'albedo', vec4.create(1, 0, 0, 1));
        cube.scale = vec3.scale(vec3.create(), chassis_size, 0.5)
        node.addChild(cube);

        let shape = node.addComponent(BoxShape);
        shape.size = chassis_size
        shape.body.mass = 1;
        shape.body.impl.setActivationState(4);

        const ps = PhysicsSystem.instance;
        const ammo = PhysicsSystem.instance.ammo;
        const tuning = new ammo.btVehicleTuning();
        const rayCaster = new ammo.btDefaultVehicleRaycaster(ps.world.impl)
        const vehicle = new ammo.btRaycastVehicle(tuning, shape.body.impl, rayCaster);
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
        ps.world.impl.addAction(vehicle);
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
        const ps = PhysicsSystem.instance;

        ps.bt_vec3_a.setValue(...pos);
        ps.bt_vec3_b.setValue(0, -1, 0);
        ps.bt_vec3_c.setValue(-1, 0, 0);
        const wheelInfo = impl.addWheel(ps.bt_vec3_a, ps.bt_vec3_b, ps.bt_vec3_c, suspension_restLength, wheel_radius, tuning, isFront)
        wheelInfo.set_m_suspensionStiffness(20);

        const node = new Node;
        const cylinder = gltf_primitive.createScene("Cylinder")!.children[0];
        cylinder.scale = vec3.create(wheel_radius, wheel_width / 2, wheel_radius)
        cylinder.euler = vec3.create(0, 0, 90)
        node.addChild(cylinder)
        const cube = gltf_primitive.createScene("Cube", true)!.children[0];
        cube.scale = vec3.create(wheel_width / 2 + 0.01, wheel_radius - 0.01, wheel_radius / 3)
        let meshRenderer = cube.getComponent(MeshRenderer)!;
        meshRenderer.materials[0].passes[0].setUniform('Constants', 'albedo', vec4.create(1, 0, 0, 1));
        node.addChild(cube)
        this.node.addChild(node);
        this._wheels.push(node);
    }
}