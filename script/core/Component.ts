import Node from "./Node.js";

export default abstract class Component {
    protected _node: Node;
    constructor(node: Node) {
        this._node = node;
    }

    start(): void { }

    update(dt: number): void { }
}