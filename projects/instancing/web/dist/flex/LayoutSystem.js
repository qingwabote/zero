import { System, Zero } from 'engine';
import * as yoga from "./yoga/index.js";
export class LayoutSystem extends System {
    constructor() {
        super(...arguments);
        this._roots = [];
        this._dirties = new Set;
    }
    addRoot(node) {
        this._roots.push(node);
    }
    markDirty(element) {
        this._dirties.add(element);
    }
    lateUpdate(dt) {
        for (const node of this._roots) {
            node.deref().calculateLayout('auto', 'auto', yoga.Direction.LTR);
        }
        for (const dirty of this._dirties) {
            dirty.layout_update();
        }
        this._dirties.clear();
    }
}
LayoutSystem.instance = new LayoutSystem();
Zero.registerSystem(LayoutSystem.instance, 0);
