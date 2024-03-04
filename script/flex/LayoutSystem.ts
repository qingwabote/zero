import { SmartRef } from 'bastard';
import { System, Zero } from 'engine';
import { Element } from './Element.js';
import * as yoga from "./yoga/index.js";

export class LayoutSystem extends System {

    static readonly instance = new LayoutSystem();

    private _roots: SmartRef<yoga.Node>[] = [];

    private _dirties: Set<Element> = new Set;

    addRoot(node: SmartRef<yoga.Node>) {
        this._roots.push(node);
    }

    markDirty(element: Element) {
        this._dirties.add(element)
    }

    override lateUpdate(dt: number): void {
        for (const node of this._roots) {
            node.deref().calculateLayout('auto', 'auto', yoga.Direction.LTR);
        }
        for (const dirty of this._dirties) {
            dirty.layout_update();
        }
        this._dirties.clear();
    }
}

Zero.registerSystem(LayoutSystem.instance, 0)