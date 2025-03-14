import { Input, StrokeRenderer, vec2, vec3 } from "engine";
import { ElementContainer, Renderer } from "flex";
import { JoystickInput } from "./JoystickInput.js";
const vec3_a = vec3.create();
const vec3_b = vec3.create();
const vec3_c = vec3.create();
const vec3_d = vec3.create();
export class Joystick extends ElementContainer {
    start() {
        const point = vec2.create();
        const color = [0, 1, 0, 1];
        const primitive = Renderer.create(StrokeRenderer);
        this.input.on(JoystickInput.Events.CHANGE, () => {
            this.draw(primitive, this.input.point, color);
        });
        primitive.emitter.on(Input.TouchEvents.START, event => {
            const local = event.touch.local;
            vec2.set(point, Math.max(Math.min(local[0], 1), -1), Math.max(Math.min(local[1], 1), -1));
            this.input.point = point;
        });
        primitive.emitter.on(Input.TouchEvents.MOVE, event => {
            const local = event.touch.local;
            vec2.set(point, Math.max(Math.min(local[0], 1), -1), Math.max(Math.min(local[1], 1), -1));
            this.input.point = point;
        });
        primitive.emitter.on(Input.TouchEvents.END, () => {
            vec2.set(point, 0, 0);
            this.input.point = point;
        });
        primitive.setWidthPercent(100);
        primitive.setHeightPercent(100);
        this.draw(primitive, this.input.point, color);
        this.addElement(primitive);
    }
    draw(primitive, point, color) {
        const impl = primitive.impl;
        impl.clear();
        const halfPoint = 0.2;
        vec3.set(vec3_a, -1 - halfPoint, 1 + halfPoint, 0);
        vec3.set(vec3_b, -1 - halfPoint, -1 - halfPoint, 0);
        vec3.set(vec3_c, 1 + halfPoint, -1 - halfPoint, 0);
        vec3.set(vec3_d, 1 + halfPoint, 1 + halfPoint, 0);
        impl.line(vec3_a, vec3_b, color);
        impl.line(vec3_b, vec3_c, color);
        impl.line(vec3_c, vec3_d, color);
        impl.line(vec3_d, vec3_a, color);
        vec3.set(vec3_a, point[0] - halfPoint, point[1] + halfPoint, 0);
        vec3.set(vec3_b, point[0] - halfPoint, point[1] - halfPoint, 0);
        vec3.set(vec3_c, point[0] + halfPoint, point[1] - halfPoint, 0);
        vec3.set(vec3_d, point[0] + halfPoint, point[1] + halfPoint, 0);
        impl.line(vec3_a, vec3_b, color);
        impl.line(vec3_b, vec3_c, color);
        impl.line(vec3_c, vec3_d, color);
        impl.line(vec3_d, vec3_a, color);
    }
}
