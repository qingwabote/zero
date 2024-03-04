import { Primitive, TouchEventName, vec2, vec3 } from "engine";
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
        const primitive = Renderer.create(Primitive);
        primitive.setWidth('100%');
        primitive.setHeight('100%');
        primitive.impl.color = [0, 1, 0, 1];
        this.draw(primitive, this._point);
        this.addElement(primitive);
        primitive.emitter.on(TouchEventName.START, event => {
            const local = event.touch.local;
            vec2.set(this._point, Math.max(Math.min(local[0], 1), -1), Math.max(Math.min(local[1], 1), -1));
            this.draw(primitive, this._point);
            this.emitter.emit(JoystickEventType.CHANGED);
        });
        primitive.emitter.on(TouchEventName.MOVE, event => {
            const local = event.touch.local;
            vec2.set(this._point, Math.max(Math.min(local[0], 1), -1), Math.max(Math.min(local[1], 1), -1));
            this.draw(primitive, this._point);
            this.emitter.emit(JoystickEventType.CHANGED);
        });
        primitive.emitter.on(TouchEventName.END, event => {
            vec2.set(this._point, 0, 0);
            this.draw(primitive, this._point);
            this.emitter.emit(JoystickEventType.CHANGED);
        });
        this._primitive = primitive;
    }
    draw(primitive, point) {
        const impl = primitive.impl;
        impl.clear();
        const halfPoint = 0.2;
        vec3.set(vec3_a, -1 - halfPoint, 1 + halfPoint, 0);
        vec3.set(vec3_b, -1 - halfPoint, -1 - halfPoint, 0);
        vec3.set(vec3_c, 1 + halfPoint, -1 - halfPoint, 0);
        vec3.set(vec3_d, 1 + halfPoint, 1 + halfPoint, 0);
        impl.drawLine(vec3_a, vec3_b);
        impl.drawLine(vec3_b, vec3_c);
        impl.drawLine(vec3_c, vec3_d);
        impl.drawLine(vec3_d, vec3_a);
        vec3.set(vec3_a, point[0] - halfPoint, point[1] + halfPoint, 0);
        vec3.set(vec3_b, point[0] - halfPoint, point[1] - halfPoint, 0);
        vec3.set(vec3_c, point[0] + halfPoint, point[1] - halfPoint, 0);
        vec3.set(vec3_d, point[0] + halfPoint, point[1] + halfPoint, 0);
        impl.drawLine(vec3_a, vec3_b);
        impl.drawLine(vec3_b, vec3_c);
        impl.drawLine(vec3_c, vec3_d);
        impl.drawLine(vec3_d, vec3_a);
    }
}
