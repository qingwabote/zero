import { Component } from "engine";
import { phys } from "phys";
import { BoxShape } from "../BoxShape.js";
import { World } from "../World.js";
export class Chassis extends Component {
    get mass() {
        return this._shape.body.mass;
    }
    set mass(value) {
        this._shape.body.mass = value;
    }
    constructor(node) {
        super(node);
        this._shape = this.node.addComponent(BoxShape);
        phys.fn.physCollisionObject_setActivationState(this._shape.body.pointer, 4);
        this.pointer = phys.fn.physVehicle_new(World.instance.pointer, this._shape.body.pointer);
    }
}
