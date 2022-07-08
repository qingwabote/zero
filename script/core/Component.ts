import game from "./game.js";
import Node from "./Node.js";

export default abstract class Component {
    protected _node: Node;
    constructor(node: Node) {
        game.componentStartInvoker.add(this);
        game.componentUpdateInvoker.add(this);
        this._node = node;
    }

    start(): void { }

    update(dt: number): void { }
}