import Component from "./Component.js"
import { ComponentInvoker } from "./ComponentInvoker.js"

export default class ComponentScheduler {
    private _startInvoker: ComponentInvoker = new ComponentInvoker(function (com) { com.start() }, true)
    private _updateInvoker: ComponentInvoker = new ComponentInvoker(function (com, dt) { com.update(dt) }, false)

    add(com: Component): void {
        this._startInvoker.add(com);
        this._updateInvoker.add(com);
    }

    update(dt: number) {
        this._startInvoker.invoke(dt);
        this._updateInvoker.invoke(dt);
    }
}