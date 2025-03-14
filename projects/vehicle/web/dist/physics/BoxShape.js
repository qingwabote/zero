import { Component } from 'engine';
import { phys } from 'phys';
import { RigidBody } from './RigidBody.js';
export class BoxShape extends Component {
    constructor(node) {
        super(node);
        this.pointer = phys.fn.physBoxShape_new();
        let body = this.node.getComponent(RigidBody);
        if (!body) {
            body = this.node.addComponent(RigidBody);
        }
        body.addShape(this);
        this.body = body;
    }
}
