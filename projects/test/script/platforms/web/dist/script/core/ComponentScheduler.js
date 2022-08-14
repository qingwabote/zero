import { ComponentInvoker } from "./ComponentInvoker.js";
export default class ComponentScheduler {
    _startInvoker = new ComponentInvoker(function (com) { com.start(); }, true);
    _updateInvoker = new ComponentInvoker(function (com, dt) { com.update(dt); }, false);
    add(com) {
        this._startInvoker.add(com);
        this._updateInvoker.add(com);
    }
    update(dt) {
        this._startInvoker.invoke(dt);
        this._updateInvoker.invoke(dt);
    }
}
//# sourceMappingURL=ComponentScheduler.js.map