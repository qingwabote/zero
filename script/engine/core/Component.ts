import { Node } from "./Node.js";

export abstract class Component {
    constructor(readonly node: Node) { }

    start(): void { }
    update(dt: number): void { }
    lateUpdate(): void { }
}