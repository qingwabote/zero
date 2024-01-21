import { Zero } from 'engine';
import * as yoga from "./yoga/index.js";
export class LayoutSystem {
    constructor() {
        this._roots = [];
    }
    addRoot(node) {
        this._roots.push(node);
    }
    update(dt) {
        for (const node of this._roots) {
            node.deref().calculateLayout('auto', 'auto', yoga.Direction.LTR);
        }
    }
}
LayoutSystem.instance = new LayoutSystem();
Zero.registerSystem(LayoutSystem.instance, 0);
