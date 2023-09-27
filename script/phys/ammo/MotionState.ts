import { impl } from "./context.js";

export class MotionState {
    readonly impl = new impl.MotionState();

    set getWorldTransform(value: () => void) {
        this.impl.getWorldTransform = (ptr_bt_transform: number) => {
            value();
        }
    }

    set setWorldTransform(value: () => void) {
        this.impl.setWorldTransform = (ptr_bt_transform: number) => {
            value();
        }
    }
}