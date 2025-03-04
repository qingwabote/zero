import { Component, Node } from "engine";
import { phys } from "phys";
import { BoxShape } from "../BoxShape.js";
import { PhysicsSystem } from "../PhysicsSystem.js";

export class Chassis extends Component {
    readonly pointer;

    private readonly _shape: BoxShape = this.node.addComponent(BoxShape);

    public get mass(): number {
        return this._shape.body.mass;
    }
    public set mass(value: number) {
        this._shape.body.mass = value;
    }

    constructor(node: Node) {
        super(node);

        phys.fn.physCollisionObject_setActivationState(this._shape.body.pointer, 4);
        this.pointer = phys.fn.physVehicle_new(PhysicsSystem.instance.world.pointer, this._shape.body.pointer);
    }
}