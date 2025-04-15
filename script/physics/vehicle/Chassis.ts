import { Component, Node } from "engine";
import { pk } from "puttyknife";
import { BoxShape } from "../BoxShape.js";
import { World } from "../World.js";

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

        pk.fn.physCollisionObject_setActivationState(this._shape.body.pointer, 4);
        this.pointer = pk.fn.physVehicle_new(World.instance.pointer, this._shape.body.pointer);
    }
}