import Node from "../Node.js";

export default abstract class Component {
    constructor(readonly node: Node) { }

    start(): void { }

    update(): void { }

    commit(): void { }
}