import { Component, GLTF, MeshRenderer, Node, quat, vec3, vec4 } from "engine";
import { phys } from "phys";
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

const physV3_a = phys.fn.physVector3_new();
const physV3_b = phys.fn.physVector3_new();
const physV3_c = phys.fn.physVector3_new();

const v3_a = vec3.create();
const q_a = quat.create();

export default class Vehicle extends Component {
    private readonly _pointer;
    private _wheels!: Node[];

    primitive!: GLTF.Instance;

    public setEngineForce(value: number, wheel: number) {
        phys.fn.physVehicle_applyEngineForce(this._pointer, -value, wheel)
    }

    public setSteeringValue(value: number, wheel: number) {
        phys.fn.physVehicle_setSteeringValue(this._pointer, value, wheel);
    }

    constructor(node: Node) {
        super(node);

        const shape = this.node.addComponent(BoxShape);
        shape.size = chassis_size
        shape.body.mass = 1;
        phys.fn.physCollisionObject_setActivationState(shape.body.pointer, 4);

        const vehicle = phys.fn.physVehicle_new(PhysicsSystem.instance.pointer, shape.body.pointer);

        for (const info of wheel_create_infos) {
            phys.fn.physVector3_set(physV3_a, ...info.position)
            phys.fn.physVector3_set(physV3_b, 0, -1, 0)
            phys.fn.physVector3_set(physV3_c, -1, 0, 0)
            phys.fn.physVehicle_addWheel(vehicle, physV3_a, physV3_b, physV3_c, suspension_restLength, 20, wheel_radius, info.isFront)
        }

        this._pointer = vehicle;
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
        for (let i = 0; i < this._wheels.length; i++) {
            // this._impl.updateWheelTransform(i, true);
            const t = phys.fn.physVehicle_getWheelTransform(this._pointer, i);
            const p = phys.fn.physTransform_getPosition(t);
            const q = phys.fn.physTransform_getRotation(t);
            const node = this._wheels[i];
            node.world_position = vec3.set(v3_a, phys.fn.physVector3_getX(p), phys.fn.physVector3_getY(p), phys.fn.physVector3_getZ(p));
            node.world_rotation = quat.set(q_a, phys.fn.physQuat_getX(q), phys.fn.physQuat_getY(q), phys.fn.physQuat_getZ(q), phys.fn.physQuat_getW(q));
        }
    }
}