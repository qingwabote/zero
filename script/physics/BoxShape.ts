import { Component, Node } from 'engine';
import { pk } from 'puttyknife';
import { RigidBody } from './RigidBody.js';

export class BoxShape extends Component {
    readonly body: RigidBody;

    readonly pointer = pk.fn.physBoxShape_new();

    constructor(node: Node) {
        super(node);

        let body = this.node.getComponent(RigidBody);
        if (!body) {
            body = this.node.addComponent(RigidBody);
        }

        body.addShape(this);

        this.body = body;
    }
}