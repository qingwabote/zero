import Component from "../Component.js"
import { ComponentInvoker } from "./ComponentInvoker.js"

export default class ComponentScheduler {
    private _startInvoker: ComponentInvoker = new ComponentInvoker(function (com) { com.start() }, true)
    private _updateInvoker: ComponentInvoker = new ComponentInvoker(function (com) { com.update() }, false)
    private _lateUpdateInvoker: ComponentInvoker = new ComponentInvoker(function (com) { com.lateUpdate() }, false)

    private _busying = false;

    private _addingQueue: Component[] = [];

    add(com: Component): void {
        if (this._busying) {
            this._addingQueue.push(com);
            return;
        }
        this.schedule(com);
    }

    start() {
        this._busying = true;
        this._startInvoker.invoke();
    }

    update() {
        this._updateInvoker.invoke();
    }

    lateUpdate() {
        this._lateUpdateInvoker.invoke();
        for (const com of this._addingQueue) {
            this.schedule(com);
        }
        this._addingQueue.length = 0;
        this._busying = false;
    }

    private schedule(com: Component) {
        this._startInvoker.add(com);
        this._updateInvoker.add(com);
        this._lateUpdateInvoker.add(com);
    }
}