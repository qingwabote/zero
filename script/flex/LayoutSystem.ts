import { SmartRef } from 'bastard';
import { System, Zero } from 'engine';
import * as yoga from "./yoga/index.js";

export class LayoutSystem implements System {

    static readonly instance = new LayoutSystem();

    private _roots: SmartRef<yoga.Node>[] = [];

    addRoot(node: SmartRef<yoga.Node>) {
        this._roots.push(node);
    }

    update(dt: number): void {
        for (const node of this._roots) {
            node.deref().calculateLayout('auto', 'auto', yoga.Direction.LTR);
        }
    }
}

Zero.registerSystem(LayoutSystem.instance, 0)