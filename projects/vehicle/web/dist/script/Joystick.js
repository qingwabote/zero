import { GeometryRenderer, TouchEventName, vec2, vec3 } from "engine";
import { ElementContainer, Renderer } from "flex";
const vec3_a = vec3.create();
const vec3_b = vec3.create();
const vec3_c = vec3.create();
const vec3_d = vec3.create();
export var JoystickEventType;
(function (JoystickEventType) {
    JoystickEventType["CHANGED"] = "CHANGED";
})(JoystickEventType || (JoystickEventType = {}));
export default class Joystick extends ElementContainer {
    get point() {
        return this._point;
    }
    constructor(node) {
        super(node);
        this._point = vec2.create();
        const color = [0, 1, 0, 1];
        const primitive = Renderer.create(GeometryRenderer);
        primitive.setWidth('100%');
        primitive.setHeight('100%');
        this.draw(primitive, this._point, color);
        this.addElement(primitive);
        primitive.emitter.on(TouchEventName.START, event => {
            const local = event.touch.local;
            vec2.set(this._point, Math.max(Math.min(local[0], 1), -1), Math.max(Math.min(local[1], 1), -1));
            this.draw(primitive, this._point, color);
            this.emitter.emit(JoystickEventType.CHANGED);
        });
        primitive.emitter.on(TouchEventName.MOVE, event => {
            const local = event.touch.local;
            vec2.set(this._point, Math.max(Math.min(local[0], 1), -1), Math.max(Math.min(local[1], 1), -1));
            this.draw(primitive, this._point, color);
            this.emitter.emit(JoystickEventType.CHANGED);
        });
        primitive.emitter.on(TouchEventName.END, () => {
            vec2.set(this._point, 0, 0);
            this.draw(primitive, this._point, color);
            this.emitter.emit(JoystickEventType.CHANGED);
        });
    }
    draw(primitive, point, color) {
        const impl = primitive.impl;
        impl.clear();
        const halfPoint = 0.2;
        vec3.set(vec3_a, -1 - halfPoint, 1 + halfPoint, 0);
        vec3.set(vec3_b, -1 - halfPoint, -1 - halfPoint, 0);
        vec3.set(vec3_c, 1 + halfPoint, -1 - halfPoint, 0);
        vec3.set(vec3_d, 1 + halfPoint, 1 + halfPoint, 0);
        impl.drawLine(vec3_a, vec3_b, color);
        impl.drawLine(vec3_b, vec3_c, color);
        impl.drawLine(vec3_c, vec3_d, color);
        impl.drawLine(vec3_d, vec3_a, color);
        vec3.set(vec3_a, point[0] - halfPoint, point[1] + halfPoint, 0);
        vec3.set(vec3_b, point[0] - halfPoint, point[1] - halfPoint, 0);
        vec3.set(vec3_c, point[0] + halfPoint, point[1] - halfPoint, 0);
        vec3.set(vec3_d, point[0] + halfPoint, point[1] + halfPoint, 0);
        impl.drawLine(vec3_a, vec3_b, color);
        impl.drawLine(vec3_b, vec3_c, color);
        impl.drawLine(vec3_c, vec3_d, color);
        impl.drawLine(vec3_d, vec3_a, color);
    }
}
