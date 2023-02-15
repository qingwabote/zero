import Component from "./base/Component.js"
import { ComponentInvoker } from "./ComponentInvoker.js"

export default class ComponentScheduler {
    private _startInvoker: ComponentInvoker = new ComponentInvoker(function (com) { com.start() }, true)
    private _updateInvoker: ComponentInvoker = new ComponentInvoker(function (com) { com.update() }, false)
    private _commitInvoker: ComponentInvoker = new ComponentInvoker(function (com) { com.commit() }, false)

    add(com: Component): void {
        this._startInvoker.add(com);
        this._updateInvoker.add(com);
        this._commitInvoker.add(com);
    }

    start() {
        this._startInvoker.invoke();
    }

    update() {
        this._updateInvoker.invoke();
    }

    commit() {
        this._commitInvoker.invoke();
    }
}