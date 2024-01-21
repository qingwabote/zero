import { impl } from "./context.js";
export class MotionState {
    constructor() {
        this.impl = new impl.MotionState();
    }
    set getWorldTransform(value) {
        this.impl.getWorldTransform = (ptr_bt_transform) => {
            value();
        };
    }
    set setWorldTransform(value) {
        this.impl.setWorldTransform = (ptr_bt_transform) => {
            value();
        };
    }
}
