import Component from "./Component.js"
import { ComponentInvoker } from "./ComponentInvoker.js"

export default class ComponentScheduler {
    private _startInvoker: ComponentInvoker = new ComponentInvoker(function (com) { com.start() }, true)
    private _updateInvoker: ComponentInvoker = new ComponentInvoker(function (com) { com.update() }, false)

    add(com: Component): void {
        this._startInvoker.add(com);
        this._updateInvoker.add(com);
    }

    update() {
        this._startInvoker.invoke();
        this._updateInvoker.invoke();
    }
}